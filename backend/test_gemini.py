import os
from dotenv import load_dotenv
from google import genai

# Load the API key from your .env file
load_dotenv()

try:
    print("Initializing Gemini Client...")
    client = genai.Client()
    
    print("Sending test prompt to Gemini...")
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents='Respond with a short, funny confirmation that you are online and working.'
    )
    
    print("\n✅ SUCCESS! Gemini responded:")
    print("-" * 40)
    print(response.text)
    print("-" * 40)

except Exception as e:
    print("\n❌ ERROR: Failed to connect to Gemini.")
    print(f"Details: {e}")