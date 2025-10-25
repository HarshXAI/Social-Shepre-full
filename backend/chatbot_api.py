from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import ollama
import joblib  # Import for loading the trained model
import torch  # If using PyTorch

app = FastAPI()

# Load the trained chatbot model (modify based on your implementation)
MODEL_PATH = "chatbot.ipynb"
model = joblib.load(MODEL_PATH)  # Adjust if using a different format

# Define system message
SYSTEM_MESSAGE = "You are a helpful assistant."

# Request model
class ChatRequest(BaseModel):
    message: str
    history: list = []

# Chatbot function using the trained model
def chatbot_response(user_message, history):
    messages = [{"role": "system", "content": SYSTEM_MESSAGE}] + history + [{"role": "user", "content": user_message}]
    
    try:
        response = model.generate_response(messages)  # Adjust based on your model's method
        return response if response else "Error: Unexpected response format"
    except Exception as e:
        return f"Error: {str(e)}"

@app.post("/chatbot")
def chat(request: ChatRequest):
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    response = chatbot_response(request.message, request.history)
    return {"response": response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
