from flask import Flask, request, jsonify, make_response, redirect
from flask_cors import CORS
import re
import json
from typing import Optional, List, Dict, Any
import os
import sys
import tempfile
import requests
from collections import Counter
from textblob import TextBlob
import numpy as np
import traceback

# Import functions from existing scripts
from fetcher import fetch_reddit_data, fetch_newsapi_data, make_json_serializable
from bakchodi import generate_social_post, should_fetch_data, classify_prompt, detect_language_request
from bakchodi import generate_image_from_post, generate_image_prompt
from firebase_storage import initialize_firebase

# Hardcoded Firebase bucket name
FIREBASE_STORAGE_BUCKET = "mern-blog-248bd.appspot.com"

# Set environment variable for Firebase bucket (for other modules that might use it)
os.environ['FIREBASE_STORAGE_BUCKET'] = FIREBASE_STORAGE_BUCKET

# Initialize Firebase at startup
initialize_firebase()

# Create Flask app
app = Flask(__name__)
CORS(app)

# --- Instagram API Configuration ---
ACCESS_TOKEN = "IGAAImERmTpN9BZAE9UNW9zZAWdYZATgwZAHJyVDF5d0Y4ZA2pZARWp0OHhJdDZAIaW4ycWlON3lpNDVnM2NUQ1NyQW9qanNRMno3ZAGN1RkRwYmFOazI5VVBjWVNUa2JJby1YX3ZAyZA04zX0xTTmN1RTlsTnEtOUZAleU9ueVZAHU3dZAd2Y0MAZDZD"

# --- Social Media Post Generator Routes ---

@app.route('/', methods=['GET'])
def root():
    return jsonify({"message": "Social Media Post Generator API is running. Use /generate-post endpoint to create posts."})

@app.route('/generate-post', methods=['POST'])
def generate_post():
    try:
        request_data = request.get_json()
        prompt = request_data.get('prompt')
        
        if not prompt:
            return jsonify({"detail": "Missing prompt in request"}), 400
            
        # Use the updated bakchodi.py functionality
        result = generate_social_post(prompt)
        
        # Add the flag that indicates if trending data was used
        needs_trending = should_fetch_data(prompt)
        result["used_trending_data"] = needs_trending
        
        # Debug output to help diagnose image issues
        print(f"API response structure: {result}")
        
        # Handle Firebase image URLs
        if "image_path" in result and result["image_path"] is not None:
            if isinstance(result["image_path"], dict):
                # Extract Firebase image info
                firebase_info = result["image_path"]
                result["firebase_path"] = firebase_info.get("firebase_path")
                result["image_url"] = firebase_info.get("public_url")
                
                # Remove the old image_path field to avoid confusion
                del result["image_path"]
                
                print(f"Image URL included in response: {result.get('image_url')}")
            else:
                print(f"Unexpected image_path format: {type(result['image_path'])}, value: {result['image_path']}")
        else:
            print("No image_path in result. Image generation may have failed or wasn't triggered.")
            # Force image generation for testing
            if "instagram" not in prompt.lower() and "image" not in prompt.lower():
                print("Adding 'image' to prompt to force image generation")
                modified_prompt = prompt + " with image"
                platform = result.get('platform', 'twitter')
                
                # Generate image manually
                image_result = generate_image_from_post(result.get('post', ''), result.get('topic', 'general'))
                if image_result:
                    result["firebase_path"] = image_result.get("firebase_path")
                    result["image_url"] = image_result.get("public_url")
                    result["image_prompt"] = generate_image_prompt(result.get('post', ''), result.get('topic', 'general'))
                    print(f"Manually generated image URL: {result.get('image_url')}")
        
        return jsonify(result)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"detail": f"Error generating post: {str(e)}"}), 500

@app.route('/sample-prompts', methods=['GET'])
def sample_prompts():
    samples = [
        "Create a Twitter post about AI",
        "Generate an Instagram post on climate change in Hindi",
        "Write a Facebook post regarding cryptocurrency trends",
        "Make a social media post about space exploration in Gujarati",
        "Create a Twitter post on technology trends and translate to Marathi"
    ]
    return jsonify(samples)

@app.route('/profile', methods=['GET'])
def fetch_user_profile():
    url = "https://graph.instagram.com/me"
    params = {
        "access_token": ACCESS_TOKEN,
        "fields": "id,username,media_count"
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"error": "Failed to fetch profile"}), response.status_code

@app.route('/media', methods=['GET'])
def fetch_user_media():
    url = "https://graph.instagram.com/me/media"
    params = {
        "access_token": ACCESS_TOKEN,
        "fields": "id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count",
        "limit": 20
    }
    all_media = []
    while url:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            all_media.extend(data.get("data", []))
            url = data.get("paging", {}).get("next")
        else:
            return jsonify({"error": "Failed to fetch media"}), response.status_code
    return jsonify(all_media)

@app.route('/analyze', methods=['POST'])
def analyze_posts():
    media = request.json
    captions = [post.get("caption", "") for post in media]
    likes = [post.get("like_count", 0) for post in media]
    comments = [post.get("comments_count", 0) for post in media]
    all_words = " ".join(captions).split()

    word_freq = Counter(all_words)
    sentiments = [TextBlob(caption).sentiment.polarity for caption in captions]
    engagement_rates = [like + comment for like, comment in zip(likes, comments)]
    most_liked_post = media[np.argmax(likes)]

    avg_likes = np.mean(likes)
    avg_comments = np.mean(comments)
    avg_sentiment = np.mean(sentiments)

    content_types = {}
    for post in media:
        media_type = post.get("media_type", "")
        content_types[media_type] = content_types.get(media_type, 0) + 1

    positive = sum(1 for s in sentiments if s > 0)
    neutral = sum(1 for s in sentiments if s == 0)
    negative = sum(1 for s in sentiments if s < 0)

    hashtags = []
    for post in media:
        caption = post.get("caption", "")
        hashtags.extend([word.lower() for word in caption.split() if word.startswith("#")])
    hashtag_freq = Counter(hashtags)
    top_hashtags = hashtag_freq.most_common(5)

    analysis = {
        "word_freq": dict(word_freq.most_common(10)),
        "avg_likes": avg_likes,
        "avg_comments": avg_comments,
        "avg_sentiment": avg_sentiment,
        "most_liked_post": most_liked_post,
        "content_types": content_types,
        "sentiment_categories": {"positive": positive, "neutral": neutral, "negative": negative},
        "top_hashtags": dict(top_hashtags)
    }
    return jsonify(analysis)

# --- Run the Flask App ---
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)