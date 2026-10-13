"""
Single place for every call to the AI provider (chat + embeddings).

Currently using Mistral.

To switch to Ollama later, only this file needs to change. The OLLAMA_*
values are kept in .env / .env.example for that purpose:

    OLLAMA_BASE_URL, OLLAMA_CHAT_MODEL, OLLAMA_EMBED_MODEL

NOTE: embeddings from different models have different dimensions, so after
switching provider, point CHROMA_COLLECTION_NAME (app/ai/vector_store.py)
at a new collection and re-upload / re-index the study materials.
"""

import os
import time

import httpx

from dotenv import load_dotenv
from mistralai.client import Mistral

load_dotenv()


MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

if not MISTRAL_API_KEY:
    raise RuntimeError("MISTRAL_API_KEY environment variable is not set.")

_client = Mistral(api_key=MISTRAL_API_KEY)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL") or "openai/gpt-4o-mini"

CHAT_MODEL = "mistral-small-latest"
EMBED_MODEL = "mistral-embed"


def _with_retry(call, attempts: int = 5):
    """Retry on Mistral rate limits (HTTP 429) with exponential backoff."""
    for attempt in range(attempts):
        try:
            return call()
        except Exception as error:
            rate_limited = "429" in str(error) or "rate" in str(error).lower()

            if not rate_limited or attempt == attempts - 1:
                raise

            time.sleep(2 ** attempt)


def chat(prompt: str) -> str:
    """Send a single user prompt and return the model's text answer.

    Uses OpenRouter when OPENROUTER_API_KEY is set, otherwise Mistral.
    """
    if OPENROUTER_API_KEY:
        response = httpx.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}"},
            json={
                "model": OPENROUTER_MODEL,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=120,
        )
        response.raise_for_status()

        return response.json()["choices"][0]["message"]["content"]

    response = _with_retry(
        lambda: _client.chat.complete(
            model=CHAT_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
    )

    return response.choices[0].message.content


def embed(text: str) -> list[float]:
    """Return the embedding vector for a piece of text."""
    response = _with_retry(
        lambda: _client.embeddings.create(
            model=EMBED_MODEL,
            inputs=[text],
        )
    )

    return response.data[0].embedding
