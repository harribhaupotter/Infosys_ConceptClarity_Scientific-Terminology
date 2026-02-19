from fastapi import FastAPI
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import re
import os

load_dotenv()

app = FastAPI()

# Replace "llama3" with Groq's hosted Llama 3 (actually better - 70B vs 8B)
MODEL_ID = "llama-3.3-70b-versatile"

# Groq client - reads API key from environment variable
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

class ExplainRequest(BaseModel):
    term: str
    level: str  # "student", "enthusiast", or "expert"
    language: str = "en"  # "en", "hi", or "mr"

def build_prompt(term: str, level: str, language: str = "en") -> str:
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

def call_groq(prompt: str) -> str:
    """Single reusable function to call Groq API"""
    response = client.chat.completions.create(
        model=MODEL_ID,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=500
    )
    return response.choices[0].message.content.strip()

def generate_related_terms(term: str) -> list:
    """Generate related terms using Groq"""
    prompt = build_related_terms_prompt(term)
    
    try:
        related_terms_text = call_groq(prompt)
        
        # All your existing parsing logic stays exactly the same
        related_terms_text = related_terms_text.replace("Related terms:", "").replace("Terms:", "")
        related_terms_text = related_terms_text.replace("Here are", "").replace("The related terms are", "")
        related_terms_text = related_terms_text.replace('"', '').replace("'", "").replace("`", "")
        
        terms = []
        for t in related_terms_text.split(','):
            cleaned = t.strip()
            cleaned = cleaned.lstrip('0123456789.-) ').strip()
            for prefix in ["Term:", "Term ", "- ", "• "]:
                if cleaned.startswith(prefix):
                    cleaned = cleaned[len(prefix):].strip()
            if cleaned and len(cleaned) > 0:
                terms.append(cleaned)
        
        terms = [t for t in terms if t and len(t) > 0 and len(t) < 100][:3]
        
        if len(terms) < 3:
            patterns = [
                r'[-•]\s*([^,\n]+)',
                r'\d+[\.)]\s*([^,\n]+)',
                r'([A-Z][a-zA-Z\s]{2,})',
            ]
            for pattern in patterns:
                matches = re.findall(pattern, related_terms_text)
                if matches:
                    new_terms = [m.strip() for m in matches if m.strip() and len(m.strip()) < 100]
                    terms.extend(new_terms)
                    terms = list(dict.fromkeys(terms))[:3]
                    if len(terms) >= 3:
                        break
        
        return terms[:3] if len(terms) >= 1 else []
    except Exception as e:
        print(f"Error generating related terms: {e}")
        return []

@app.post("/generate")
def generate(req: ExplainRequest):
    try:
        prompt = build_prompt(req.term, req.level, req.language)
        explanation = call_groq(prompt)
        
        related_terms = generate_related_terms(req.term)
        
        if len(related_terms) < 3:
            fallback_terms = [
                f"{req.term} mechanism",
                f"{req.term} process",
                f"{req.term} function"
            ]
            while len(related_terms) < 3 and fallback_terms:
                related_terms.append(fallback_terms.pop(0))

        return {
            "term": req.term,
            "level": req.level,
            "explanation": explanation,
            "relative_terms": related_terms[:3]
        }
    except ValueError as ve:
        return {"error": str(ve)}
    except Exception as e:
        return {"error": f"Groq Error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)