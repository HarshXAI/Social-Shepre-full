from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from diffusers import StableDiffusionPipeline
import torch
from transformers import pipeline, GPT2LMHeadModel, GPT2Tokenizer
from sentence_transformers import SentenceTransformer
import time

app = Flask(__name__)
CORS(app)  # Enable CORS

# Ensure the static folder exists
os.makedirs("static", exist_ok=True)

# Load AI models
device = "cuda" if torch.cuda.is_available() else "cpu"

# Load Stable Diffusion for image generation
pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5")
pipe.to(device)

# Load GPT-2 for caption generation
caption_generator = pipeline("text-generation", model="gpt2")

# Load Sentence Transformer for hashtag extraction
sentence_model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

@app.route('/generate_post', methods=['POST'])
def generate_post():
    data = request.json
    description = data.get('description')

    if not description:
        return jsonify({"error": "Description is required"}), 400

    if not pipe:
        return jsonify({"error": "Stable Diffusion model is not loaded"}), 500

    try:
        # Generate image using Stable Diffusion
        image = pipe(description).images[0]
        image_filename = f"generated_image_{int(time.time())}.png"
        image_path = os.path.join('static', image_filename)
        image.save(image_path)

        # Generate caption using GPT-2
        prompt = f"Generate a detailed, descriptive caption for the image based on this description: {description}. Please focus on the visual aspects and emotions of the scene."
        generated_text = caption_generator(prompt, max_length=60, num_return_sequences=1)[0]['generated_text']
        caption = generated_text[len(prompt):].strip()

        # Generate hashtags using Sentence Transformer
        embeddings = sentence_model.encode([description])
        relevant_hashtags = []
        if 'sunset' in description:
            relevant_hashtags.extend(['#sunset', '#nature', '#ocean', '#sky', '#beauty'])
        if 'ocean' in description:
            relevant_hashtags.append('#calmocean')
        if 'color' in description:
            relevant_hashtags.append('#vibrantcolors')
        if 'waves' in description:
            relevant_hashtags.append('#oceanwaves')
        hashtags = relevant_hashtags if relevant_hashtags else ["#image", "#photo", "#art"]

        # Return the results
        return jsonify({
            "image_url": f"http://localhost:8000/static/{image_filename}",
            "caption": caption,
            "hashtags": hashtags
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=8000, debug=True)