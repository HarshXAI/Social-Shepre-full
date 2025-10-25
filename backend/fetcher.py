import time
import json
import requests
import pandas as pd
from datetime import datetime

# Helper function to make data JSON serializable
def make_json_serializable(data):
    if isinstance(data, dict):
        return {str(k): make_json_serializable(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [make_json_serializable(item) for item in data]
    elif isinstance(data, pd.Timestamp):
        return data.strftime('%Y-%m-%d %H:%M:%S')
    elif pd.isna(data):
        return None
    return data

# Helper function to filter Reddit data to only keep specified fields
def filter_reddit_data(post_data):
    if not isinstance(post_data, list):
        return post_data
    
    filtered_posts = []
    for post in post_data:
        if not isinstance(post, dict) or 'data' not in post:
            continue
            
        data = post.get('data', {})
        # Only keep the specified fields
        filtered_post = {
            'title': data.get('title'),
            'subreddit': data.get('subreddit'),
            'link_flair_text': data.get('link_flair_text'),
            'engagement': {
                'upvotes': data.get('ups') or data.get('score'),
                'comments': data.get('num_comments'),
                'upvote_ratio': data.get('upvote_ratio')
            },
            'url': data.get('url_overridden_by_dest'),
            'created_utc': data.get('created_utc'),
            'is_gallery': data.get('is_gallery'),
            'selftext': data.get('selftext')
        }
        filtered_posts.append({'kind': post.get('kind'), 'data': filtered_post})
    
    return filtered_posts

def fetch_reddit_data(topic):
    # Replace with your Reddit app credentials
    client_id = "BsiP2-BXpOR5mrzMLcYUMA"
    client_secret = "4YnNOayvqLDvbln369HKbW0C9H4AKA"
    user_agent = "impresses by ArmInternational7616"

    # Get access token
    auth_url = "https://www.reddit.com/api/v1/access_token"
    auth_data = {"grant_type": "client_credentials"}
    headers = {"User-Agent": user_agent}
    auth = (client_id, client_secret)

    try:
        auth_response = requests.post(auth_url, data=auth_data, headers=headers, auth=auth)
        auth_response.raise_for_status()
        access_token = auth_response.json().get("access_token")

        # Search Reddit for the topic
        reddit_url = "https://oauth.reddit.com/search"
        headers["Authorization"] = f"Bearer {access_token}"
        params = {
            "q": topic,       # Use user topic as search query
            "sort": "relevance",
            "limit": 5        # Fetch 5 results
        }

        response = requests.get(reddit_url, headers=headers, params=params)
        response.raise_for_status()
        reddit_data = response.json()
        print(f"\nReddit Trends for '{topic}':")
        for post in reddit_data["data"]["children"]:
            print(f"Title: {post['data']['title']} | Score: {post['data']['score']}")
        
        # Filter out the unwanted fields before returning
        filtered_data = filter_reddit_data(reddit_data["data"]["children"])
        return filtered_data
    except requests.exceptions.RequestException as e:
        print(f"Error fetching Reddit trends: {e}")
        return []

def fetch_newsapi_data(topic):
    # Replace with your NewsAPI key
    api_key = "c1b2ed761b0b41558c4d7a42bb1f26b8"
    
    # Endpoint to fetch top headlines
    url = "https://newsapi.org/v2/everything"  # Use 'everything' for broader search
    params = {
        "q": topic,       # Use user topic as search query
        "sortBy": "relevancy",
        "apiKey": api_key,
        "pageSize": 30     # Fetch 5 results
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        news_data = response.json()
        print(f"\nNewsAPI Trends for '{topic}':")
        for article in news_data.get("articles", []):
            print(f"Title: {article['title']} | Source: {article['source']['name']}")
        return news_data.get("articles", [])
    except requests.exceptions.RequestException as e:
        print(f"Error fetching NewsAPI trends: {e}")
        return []


# # Run the functions

def fetch_trends_for_user_topic():
    # Get user input
    topic = input("Enter a topic to fetch trends for (e.g., 'AI', 'climate change'): ").strip()
    if not topic:
        print("No topic entered. Please try again.")
        return

    print(f"\nFetching trends for '{topic}'...")
    
    # Since Google Trends has been removed, create an empty result structure
    
    
    # Combine results for RAG (example structure)
    combined_results = {
        
        "reddit": fetch_reddit_data(topic)
,
        "news": fetch_newsapi_data(topic),
    }
    
    # Apply JSON serialization fix to entire result
    combined_results = make_json_serializable(combined_results)
    
    # You can now pass 'combined_results' to your RAG system
    print("\nEmpty results structure ready for RAG processing:")
    print(json.dumps(combined_results, indent=2))
    
    # Save the combined results to a JSON file
    with open("output.json", "w") as f:
        json.dump(combined_results, f, indent=4)
    print("\nResults saved to output.json")
    
    
    
# Run the script
if __name__ == "__main__":
    fetch_trends_for_user_topic()