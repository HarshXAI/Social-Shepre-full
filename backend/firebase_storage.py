import os
import json
import time
import firebase_admin
from firebase_admin import credentials, storage
import io
import base64
from typing import Optional, Tuple

# Hardcoded Firebase bucket name
FIREBASE_STORAGE_BUCKET = "mern-blog-248bd.appspot.com"
FIREBASE_CREDENTIALS = "./mern-blog-248bd-firebase-adminsdk-5c6fo-45cd88f808.json"
# Initialize Firebase (will be called in the main app)
def initialize_firebase():
    """Initialize Firebase if not already initialized"""
    if not firebase_admin._apps:
        try:
            # Look for credentials file
            # cred_path = os.environ.get('FIREBASE_CREDENTIALS', 'firebase-credentials.json')
            if os.path.exists(FIREBASE_CREDENTIALS):
                cred = credentials.Certificate(FIREBASE_CREDENTIALS)
                
                # Use hardcoded bucket name
                firebase_admin.initialize_app(cred, {
                    'storageBucket': FIREBASE_STORAGE_BUCKET
                })
                print(f"Firebase initialized with bucket: {FIREBASE_STORAGE_BUCKET}")
                
                # Verify bucket access
                try:
                    bucket = storage.bucket()
                    # Try a simple operation to test bucket access
                    blobs = list(bucket.list_blobs(max_results=1))
                    print(f"Successfully connected to bucket: {bucket.name}")
                except Exception as e:
                    print(f"Warning: Could not access storage bucket: {e}")
                    print("Make sure the service account has Storage Admin permissions")
                
                return True
            else:
                print(f"Firebase credentials file not found at {cred_path}")
                return False
        except Exception as e:
            print(f"Firebase initialization error: {e}")
            return False
    return True

# Function to upload an image to Firebase Storage
def upload_image_to_firebase(image_data: bytes, filename: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Upload an image to Firebase Storage
    
    Args:
        image_data: Image data as bytes
        filename: Filename to use in Firebase Storage
        
    Returns:
        Tuple of (storage_path, public_url) or (None, None) if upload fails
    """
    try:
        if not firebase_admin._apps:
            if not initialize_firebase():
                print("Firebase initialization failed, cannot upload image")
                return None, None
                
        bucket = storage.bucket()
        print(f"Uploading to bucket: {bucket.name}")
        blob = bucket.blob(f"images/{filename}")
        
        # Upload the image with content type
        blob.upload_from_string(
            image_data,
            content_type='image/png'
        )
        
        # Make the blob publicly accessible
        blob.make_public()
        
        # Get the public URL
        public_url = blob.public_url
        
        # Create a direct download URL with token (more reliable for public access)
        download_url = f"https://firebasestorage.googleapis.com/v0/b/{FIREBASE_STORAGE_BUCKET}/o/images%2F{filename}?alt=media"
        
        storage_path = f"images/{filename}"
        
        print(f"Image uploaded to Firebase Storage: {storage_path}")
        print(f"Public URL: {public_url}")
        print(f"Download URL: {download_url}")
        
        return storage_path, download_url
    except Exception as e:
        print(f"Error uploading to Firebase: {e}")
        import traceback
        traceback.print_exc()
        return None, None