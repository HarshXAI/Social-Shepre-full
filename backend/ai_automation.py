from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline, GPT2LMHeadModel, GPT2Tokenizer
from sentence_transformers import SentenceTransformer
import torch
from diffusers import StableDiffusionPipeline
from PIL import Image
import os
import random

app = FastAPI()

# Initialize pre-trained models
caption_generator = pipeline("text-generation", model="gpt2")
sentence_model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

# Load Stable Diffusion model
model_id = "CompVis/stable-diffusion-v1-4"
pipe = StableDiffusionPipeline.from_pretrained(model_id)
pipe.to("cuda" if torch.cuda.is_available() else "cpu")

# Cache directory for saving images
cache_dir = "generated_images"
os.makedirs(cache_dir, exist_ok=True)

class PostRequest(BaseModel):
    description: str

# Generate image
def generate_image(description):
    try:
        image = pipe(description).images[0]
        image_filename = f"generated_{random.randint(1000,9999)}.png"
        image_path = os.path.join(cache_dir, image_filename)
        image.save(image_path)
        return image_path
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation error: {e}")

# Generate caption
def generate_caption(description):
    try:
        prompt = f"Generate a detailed caption for this image: {description}"
        generated_text = caption_generator(prompt, max_length=60, num_return_sequences=1)[0]['generated_text']
        return generated_text[len(prompt):].strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Caption generation error: {e}")

# Generate hashtags
def generate_hashtags(description):
    embeddings = sentence_model.encode([description])
    keywords = ['sunset', 'ocean', 'waves', 'sky', 'color', 'vibrant', 'peaceful']
    relevant_hashtags = [f"#{word}" for word in keywords if word in description]
    return relevant_hashtags if relevant_hashtags else ["#image", "#photo", "#art"]

@app.post("/generate_post")
def generate_post(request: PostRequest):
    if not request.description:
        raise HTTPException(status_code=400, detail="Description cannot be empty")
    image_path = generate_image(request.description)
    caption = generate_caption(request.description)
    hashtags = generate_hashtags(request.description)
    return {"image_url": image_path, "caption": caption, "hashtags": hashtags}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
