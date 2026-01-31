from fastapi import FastAPI
from pydantic import BaseModel
import requests  # We use requests to talk to Ollama
import re

app = FastAPI()

MODEL_ID = "llama3"

class ExplainRequest(BaseModel):
    term: str
    level: str  # "student", "enthusiast", or "expert"
    language: str = "en"  # "en", "hi", or "mr" - optional, defaults to "en"

def build_prompt(term: str, level: str, language: str = "en") -> str:
    # Language instruction
    lang_instruction = ""
    if language == "hi":
        lang_instruction = " Respond in Hindi (हिंदी)."
    elif language == "mr":
        lang_instruction = " Respond in Marathi (मराठी)."
    else:
        lang_instruction = " Respond in English."
    
    if level == "student":
        return (
            f"Explain the scientific term '{term}' in very simple language, "
            f"as if teaching a school student. Use 2 short sentences.{lang_instruction} "
            f"Provide ONLY the explanation."
        )

    elif level == "enthusiast":
        return (
            f"Explain the scientific term '{term}' clearly for a curious learner. "
            f"Use simple but accurate language in 3–4 sentences.{lang_instruction} "
            f"Provide ONLY the explanation."
        )

    elif level == "expert":
        return (
            f"Provide a concise but technical explanation of the scientific term '{term}'. "
            f"Include correct terminology and precision in 4–5 sentences.{lang_instruction} "
            f"Provide ONLY the explanation."
        )

    else:
        raise ValueError("Invalid level")

def build_related_terms_prompt(term: str) -> str:
    return (
        f"Given the scientific term '{term}', provide exactly 3 related scientific terms that are "
        f"closely connected to this term. These should be actual scientific terms from the same field or domain. "
        f"Return ONLY a comma-separated list of the 3 terms, nothing else. "
        f"Example format: 'Term1, Term2, Term3'"
    )



def generate_related_terms(term: str) -> list:
    """Generate related terms using LLM"""
    prompt = build_related_terms_prompt(term)
    ollama_url = "http://localhost:11434/api/generate"
    
    payload = {
        "model": MODEL_ID,
        "prompt": prompt,
        "stream": False
    }
    
    try:
        response = requests.post(ollama_url, json=payload, timeout=30)
        response.raise_for_status()
        result = response.json()
        
        related_terms_text = result.get("response", "").strip()
        
        # Remove common prefixes/suffixes that LLMs might add
        related_terms_text = related_terms_text.replace("Related terms:", "").replace("Terms:", "")
        related_terms_text = related_terms_text.replace("Here are", "").replace("The related terms are", "")
        
        # Parse the comma-separated list
        # Remove any extra text, quotes, or formatting
        related_terms_text = related_terms_text.replace('"', '').replace("'", "").replace("`", "")
        
        # Split by comma and clean up
        terms = []
        for t in related_terms_text.split(','):
            cleaned = t.strip()
            # Remove leading numbers, bullets, dashes
            cleaned = cleaned.lstrip('0123456789.-) ').strip()
            # Remove common prefixes
            for prefix in ["Term:", "Term ", "- ", "• "]:
                if cleaned.startswith(prefix):
                    cleaned = cleaned[len(prefix):].strip()
            if cleaned and len(cleaned) > 0:
                terms.append(cleaned)
        
        # Filter out empty strings and limit to 3
        terms = [t for t in terms if t and len(t) > 0 and len(t) < 100][:3]
        
        # If we got less than 3 terms, try to extract from the response using regex
        if len(terms) < 3:
            # Look for patterns like "1. Term", "- Term", "Term1, Term2", etc.
            patterns = [
                r'[-•]\s*([^,\n]+)',  # Bullet points
                r'\d+[\.)]\s*([^,\n]+)',  # Numbered lists
                r'([A-Z][a-zA-Z\s]{2,})',  # Capitalized terms
            ]
            for pattern in patterns:
                matches = re.findall(pattern, related_terms_text)
                if matches:
                    new_terms = [m.strip() for m in matches if m.strip() and len(m.strip()) < 100]
                    terms.extend(new_terms)
                    terms = list(dict.fromkeys(terms))[:3]  # Remove duplicates, limit to 3
                    if len(terms) >= 3:
                        break
        
        return terms[:3] if len(terms) >= 1 else []
    except Exception as e:
        # Fallback to empty list if generation fails
        print(f"Error generating related terms: {e}")
        return []

@app.post("/generate")
def generate(req: ExplainRequest):
    prompt = build_prompt(req.term, req.level, req.language)

    ollama_url = "http://localhost:11434/api/generate"
    
    payload = {
        "model": MODEL_ID,
        "prompt": prompt,
        "stream": False # We want the whole answer at once
    }

    try:
        response = requests.post(ollama_url, json=payload)
        response.raise_for_status()
        result = response.json()
        
        explanation = result.get("response", "").strip()
        
        # Generate related terms
        related_terms = generate_related_terms(req.term)
        
        # If we didn't get enough terms, use fallback
        if len(related_terms) < 3:
            # Keep what we have and add some generic fallbacks
            fallback_terms = [
                f"{req.term} mechanism",
                f"{req.term} process",
                f"{req.term} function"
            ]
            # Only add fallbacks if we have space
            while len(related_terms) < 3 and fallback_terms:
                related_terms.append(fallback_terms.pop(0))

        return {
            "term": req.term,
            "level": req.level,
            "explanation": explanation,
            "relative_terms": related_terms[:3]  # Ensure max 3 terms
        }
    except ValueError as ve:
        return {"error": str(ve)}
    except Exception as e:
        return {"error": f"Ollama Error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)