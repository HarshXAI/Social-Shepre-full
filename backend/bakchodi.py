import json
import groq
import os
import re
import requests
import base64
import time
from typing import Dict, List, Any, Optional
from deep_translator import GoogleTranslator
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Groq API key - MUST be set in .env file
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is required")

# Stability AI key for image generation
STABILITY_API_KEY = os.environ.get("STABILITY_API_KEY")
FIREBASE_STORAGE_BUCKET = "mern-blog-248bd.appspot.com"
def should_fetch_data(prompt_text: str) -> bool:
    """Determine if the prompt requires fetching current/trending data"""
    # Keywords that strongly indicate the need for trending data
    trending_keywords = [
        "trend", "trending", "current", "latest", "today", "recent", 
        "news", "update", "updates", "development", "developments",
        "market", "markets", "price", "prices", "poll", "polls",
        "stat", "stats", "statistics", "data", "analysis", "analytics",
        "popular", "viral", "hot", "breaking", "movements", "movement",
        "fluctuation", "fluctuations", "shift", "shifts", "change", "changes", "upcomming",
        "upcoming", "forecast", "forecasts", "prediction", "predictions",
        "forecasting", "predictions", "analysis", "analyses", "report", "reports",
    ]
    
    # First check if any trending keywords are in the prompt
    prompt_lower = prompt_text.lower()
    for keyword in trending_keywords:
        if keyword in prompt_lower:
            return True
    
    # If no quick match, fall back to LLM for more nuanced analysis
    client = groq.Groq(api_key=GROQ_API_KEY)
    check_prompt = f"""
    Prompt: "{prompt_text}"

    Question: Does this prompt require current, trending, or real-time information (such as from Reddit or News)?
    
    Examples that require trending data:
    - "Write about the latest cryptocurrency prices"
    - "Create a post about current AI research"
    - "What are the trending tech topics today?"
    - "Post about cryptocurrency trends"
    
    Examples that don't require trending data:
    - "Write a creative story about space travel"
    - "Create a caption for a beach sunset photo"
    - "Generate a motivational quote about success"
    
    Answer only "yes" or "no".
    """
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": check_prompt}],
        temperature=0
    )
    answer = response.choices[0].message.content.strip().lower()
    return "yes" in answer

def classify_prompt(prompt_text: str) -> Dict[str, Any]:
    """Extract topic, platform and language request from user prompt"""
    # Default platform is twitter if not specified
    platform = "twitter"
    
    # Check for platform indicators
    if "instagram" in prompt_text.lower():
        platform = "instagram"
    elif "facebook" in prompt_text.lower():
        platform = "facebook"
    
    # Check for language requests
    language_request = detect_language_request(prompt_text)
    
    # Extract topic - simple implementation
    topic_indicators = ["about", "on", "regarding", "for"]
    for indicator in topic_indicators:
        parts = prompt_text.lower().split(f" {indicator} ")
        if len(parts) > 1:
            topic = parts[1].split()[0]
            if len(topic) > 2:  # Ensure we get a meaningful topic
                return {"topic": topic, "platform": platform, "language": language_request}
    
    # Fallback to processing the whole prompt
    words = prompt_text.lower().split()
    # Filter out common words
    stopwords = ["create", "make", "post", "write", "generate", "twitter", "facebook", "instagram"]
    filtered_words = [w for w in words if w not in stopwords and len(w) > 3]
    topic = filtered_words[0] if filtered_words else "trending topics"
    
    return {"topic": topic, "platform": platform, "language": language_request}

def detect_language_request(prompt):
    """Detect if prompt contains a request for translation to a specific language"""
    language_patterns = {
        r'in hindi|translate to hindi': 'hi',
        r'in gujarati|translate to gujarati': 'gu',
        r'in marathi|translate to marathi': 'mr',
        r'in bengali|translate to bengali': 'bn',
        r'in tamil|translate to tamil': 'ta',
        r'in telugu|translate to telugu': 'te'
    }
    
    prompt_lower = prompt.lower()
    for pattern, lang_code in language_patterns.items():
        if re.search(pattern, prompt_lower):
            return lang_code
    return None

def translate_text(text, target_language):
    """Translate text while preserving hashtags and special formatting"""
    if not target_language:
        return text
        
    try:
        # Extract and temporarily replace hashtags
        hashtags = re.findall(r'(#\w+)', text)
        for i, hashtag in enumerate(hashtags):
            text = text.replace(hashtag, f"HASHTAG{i}")
        
        # Translate using deep_translator
        translator = GoogleTranslator(source='auto', target=target_language)
        translated = translator.translate(text)
        
        # Restore hashtags
        for i, hashtag in enumerate(hashtags):
            translated = translated.replace(f"HASHTAG{i}", hashtag)
        
        return translated
    except Exception as e:
        print(f"Translation error: {e}")
        return text + f"\n\n(Translation to {target_language} failed)"

def extract_topic(reddit_trends, news_trends):
    """
    Attempt to extract a common topic or keyword from Reddit/news data.
    """
    titles = [t['data']['title'] for t in reddit_trends] + [n['title'] for n in news_trends]
    keywords = [word for title in titles for word in title.lower().split()]
    common = max(set(keywords), key=keywords.count, default="this topic")
    return common.capitalize()

def build_prompt(topic: str, platform: str, reddit_trends=None, news_trends=None):
    """Build prompt based on platform and available data"""
    
    if reddit_trends and news_trends:
        reddit_titles = [t['data']['title'] for t in reddit_trends]
        news_titles = [n['title'] for n in news_trends]

        reddit_list = "\n".join([f"- {title}" for title in reddit_titles])
        news_list = "\n".join([f"- {title}" for title in news_titles])
        
        # If we have trend data, use the extract_topic function
        if isinstance(topic, str) and topic.lower() == "trending topics":
            topic = extract_topic(reddit_trends, news_trends)
    else:
        # No trend data available
        reddit_list = "No Reddit data available"
        news_list = "No News data available"

    if platform == "twitter":
        return f"""
You are a social media strategist writing a tweet about **{topic}**.

{'' if not reddit_trends or not news_trends else f'''
Reddit Trends:
{reddit_list}

News Headlines:
{news_list}
'''}

Guidelines:
- Write a concise tweet under 280 characters
- Use emojis that fit the topic and tone
- Include 2–3 smart hashtags
- Avoid markdown or formatting
- Hook the reader, provoke curiosity
"""

    elif platform == "instagram":
        return f"""
You're creating an Instagram caption based on content about **{topic}**.

{'' if not reddit_trends or not news_trends else f'''
Reddit Topics:
{reddit_list}

News Headlines:
{news_list}
'''}

Guidelines:
- Write an engaging caption
- Use topic-relevant emojis
- Include 2–3 creative hashtags
- Suggest a visual idea (e.g. reel, photo style, infographic)
- Keep the tone social and inspiring
"""

    elif platform == "facebook":
        return f"""
Write a Facebook post about **{topic}**.

{'' if not reddit_trends or not news_trends else f'''
Reddit Posts:
{reddit_list}

News Headlines:
{news_list}
'''}

Guidelines:
- Be informative but conversational
- Add emojis to keep it engaging
- End with a question to drive comments
- Encourage discussion and sharing
"""

    else:
        raise ValueError("Unsupported platform")

def fetch_and_save_data(topic: str, output_path: str = "output.json"):
    """Import fetcher and get data"""
    # Importing here to avoid circular imports
    from fetcher import fetch_reddit_data, fetch_newsapi_data, make_json_serializable
    
    # Fetch data
    reddit_data = fetch_reddit_data(topic)
    news_data = fetch_newsapi_data(topic)
    
    # Combine results
    combined_results = {
        "reddit": reddit_data,
        "news": news_data
    }
    
    # Apply JSON serialization fix to entire result
    combined_results = make_json_serializable(combined_results)
    
    # Save to JSON file
    with open(output_path, "w") as f:
        json.dump(combined_results, f, indent=4)
    
    return combined_results

def generate_image_from_post(post_text: str, topic: str) -> Optional[Dict[str, str]]:
    """
    Generate an image based on the post text and topic using Stability AI's API.
    Returns a dictionary with image info if successful, or None if failed.
    """
    if not STABILITY_API_KEY:
        print("Warning: STABILITY_API_KEY not set, image generation disabled")
        return None
        
    try:
        # Import Firebase storage functions
        from firebase_storage import upload_image_to_firebase
        
        # Create a prompt for the image model based on post and topic
        prompt = f"Create an image for a social media post about {topic}: {post_text}"
        
        # Call Stability AI API for image generation
        url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"
        
        headers = {
            "Authorization": f"Bearer {STABILITY_API_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        payload = {
            "text_prompts": [
                {
                    "text": prompt,
                    "weight": 1.0
                }
            ],
            "cfg_scale": 7,
            "height": 1024,
            "width": 1024,
            "samples": 1,
            "steps": 30
        }
        
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code != 200:
            print(f"Error generating image: {response.status_code} {response.text}")
            return None
            
        # Process and save the image
        data = response.json()
        
        # Generate a filename based on topic
        safe_topic = re.sub(r'[^\w\s]', '', topic).strip().replace(' ', '_').lower()
        filename = f"{safe_topic}_{os.urandom(4).hex()}.png"
        
        for i, image in enumerate(data["artifacts"]):
            # Get the image data
            image_data = base64.b64decode(image["base64"])
            
            # Upload to Firebase Storage
            storage_path, public_url = upload_image_to_firebase(image_data, filename)
            
            if storage_path and public_url:
                return {
                    "firebase_path": storage_path,
                    "public_url": public_url
                }
            else:
                print("Failed to upload image to Firebase")
                return None
                
            # We only requested one image, so break after the first
            break
            
        return None
            
    except Exception as e:
        print(f"Image generation error: {e}")
        return None

def generate_image_prompt(post_text: str, topic: str) -> str:
    """
    Generate a prompt for text-to-image model that would create a suitable image for the post.
    This is used as a fallback when actual image generation is not available.
    """
    client = groq.Groq(api_key=GROQ_API_KEY)
    prompt = f"""
    Create a detailed image generation prompt for a social media post with this content:
    "{post_text}"
    
    The topic is: {topic}
    
    The image prompt should:
    1. Be detailed and visual
    2. Match the tone and content of the social media post
    3. Be suitable for a text-to-image AI model
    4. Be 1-2 sentences only
    
    Just return the image prompt text without any additional explanation or formatting.
    """
    
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=200
    )
    
    return response.choices[0].message.content.strip()

def generate_social_post(json_path_or_prompt, platform="twitter"):
    """
    Generate a social media post based on either:
    1. A JSON path containing fetched data
    2. A user prompt directly
    """
    # Check if input is a path to JSON file or a prompt string
    if isinstance(json_path_or_prompt, str) and (json_path_or_prompt.endswith('.json') or os.path.exists(json_path_or_prompt)):
        # Traditional method - load from JSON file
        with open(json_path_or_prompt) as f:
            data = json.load(f)
            
        # Sort and extract top Reddit and news entries
        reddit_trends = sorted(
            data.get('reddit', []), 
            key=lambda x: x['data'].get('engagement', {}).get('upvotes', 0),
            reverse=True
        )[:3]

        news_trends = sorted(
            data.get('news', []),
            key=lambda x: x.get('publishedAt', ''),
            reverse=True
        )[:2]

        if not reddit_trends and not news_trends:
            return "No data available in JSON file."

        # Extract topic from Reddit/news data
        topic = extract_topic(reddit_trends, news_trends)
        
        # Create prompt
        prompt = build_prompt(topic, platform, reddit_trends, news_trends)
        
        # No language detection in legacy mode
        target_language = None
        
    else:
        # New method - direct from user prompt
        user_prompt = json_path_or_prompt
        info = classify_prompt(user_prompt)
        topic = info["topic"]
        platform = info.get("platform", platform)  # Use provided platform or detected one
        target_language = info.get("language")     # Get target language if specified

        if should_fetch_data(user_prompt):
            # Fetch and save data if needed
            data = fetch_and_save_data(topic)
            reddit_data = data.get("reddit", [])
            news_data = data.get("news", [])
            prompt = build_prompt(topic, platform, reddit_data, news_data)
        else:
            prompt = f"""Create a {platform} post for the following user prompt:\n"{user_prompt}"\n
Make it platform-appropriate. Keep it concise, engaging, and use emojis or hashtags if suitable."""

    # Groq API call
    client = groq.Groq(api_key=GROQ_API_KEY)
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{
            "role": "user",
            "content": prompt
        }],
        temperature=0.7,
        max_tokens=1024
    )

    result = response.choices[0].message.content.strip()
    
    # Apply translation if requested
    if target_language:
        result = translate_text(result, target_language)
    
    # Generate an image prompt or actual image
    image_path = None
    image_prompt = None
    
    # Generate images for all platforms, not just Instagram
    # Removed platform restriction to ensure images are generated for all posts
    if STABILITY_API_KEY:
        print(f"Generating image for {platform} post about {topic}")
        image_path = generate_image_from_post(result, topic)
        if image_path:
            print(f"Image generated successfully: {image_path}")
        else:
            print("Image generation failed")
    else:
        print("No Stability API key found, skipping image generation")
    
    # Always generate a text prompt for the image
    image_prompt = generate_image_prompt(result, topic)
    
    if isinstance(json_path_or_prompt, str) and not json_path_or_prompt.endswith('.json'):
        # If direct prompt, return structured response
        response_dict = {
            "topic": topic,
            "platform": platform,
            "post": result
        }
        
        # Add language info if translation was requested
        if target_language:
            response_dict["language"] = target_language
            
        # Add image information if available
        if image_path:
            response_dict["image_path"] = image_path
        if image_prompt:
            response_dict["image_prompt"] = image_prompt
            
        return response_dict
    
    # Legacy mode - return just the post content
    return result

# Example usage
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        # Direct prompt mode
        user_prompt = sys.argv[1]
        platform = sys.argv[2] if len(sys.argv) > 2 else "twitter"
        result = generate_social_post(user_prompt, platform)
        print(f"\n--- {platform.upper()} POST ---\n")
        if isinstance(result, dict):
            print(f"Topic: {result['topic']}")
            print(f"Platform: {result['platform']}")
            if "language" in result:
                print(f"Language: {result['language']}")
            if "image_path" in result:
                print(f"Image Path: {result['image_path']}")
            if "image_prompt" in result:
                print(f"Image Prompt: {result['image_prompt']}")
            print(f"Post: {result['post']}")
        else:
            print(result)
    else:
        # Legacy mode with JSON file
        for platform in ["twitter", "instagram", "facebook"]:
            print(f"\n--- {platform.upper()} POST ---\n")
            print(generate_social_post("output.json", platform))