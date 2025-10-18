import os
from openai import OpenAI
from dotenv import load_dotenv, find_dotenv
import prompts

load_dotenv(find_dotenv())

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

# prompts
model = "gpt-4o"
temperature = 0.3
max_tokens = 500
topic = "finance"
user_input = "What are some effective strategies for saving money on a tight budget?"

system_message = prompts.system_message

messages = [
    {"role": "system", "content": system_message},
    {"role": "user", "content": user_input}
]

# helper function
def get_summary():
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens
    )
    return response.choices[0].message.content

print(get_summary())