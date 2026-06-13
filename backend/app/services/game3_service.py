import json
import os
import google.generativeai as genai
import random

# Ensure your key is set
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

CONCEPTS = {
    "c1": {"id": "c1", "title": "Vision Transformers vs. Convolutional Neural Networks", "category": "Machine Learning Architecture", "difficulty": "hard"},
    "c2": {"id": "c2", "title": "REST vs. GraphQL", "category": "API Design", "difficulty": "medium"},
    "c3": {"id": "c3", "title": "The CAP Theorem", "category": "Distributed Systems", "difficulty": "hard"},
    "c4": {"id": "c4", "title": "Vertical vs. Horizontal Scaling", "category": "System Design", "difficulty": "easy"},
    "c5": {"id": "c5", "title": "Eventual Consistency", "category": "Databases", "difficulty": "medium"},
    "c6": {"id": "c6", "title": "Processes vs. Threads", "category": "Operating Systems", "difficulty": "easy"}
}

def fetch_random_concept(exclude_ids):
    # Filter out questions the player has already seen this session
    available = [card for card_id, card in CONCEPTS.items() if card_id not in exclude_ids]
    if not available:
        return None
    return random.choice(available)

def run_multi_agent_evaluation(question_id, text_answer=None, audio_path=None):
    concept = CONCEPTS.get(question_id, CONCEPTS["c1"])
    
    # ---------------------------------------------------------
    # MULTI-AGENT SYSTEM PROMPT
    # ---------------------------------------------------------
    system_prompt = f"""
    You are the Principal Moderator of a 5-Agent Technical Interview Panel. 
    The candidate was asked to explain: "{concept['title']}" ({concept['category']}).
    
    Your panel consists of 4 scoring agents. You must pass the candidate's input to them, aggregate their scores (each out of 25), and provide a final JSON response.
    
    THE AGENTS:
    1. Clarity Coach: Scores out of 25. Penalizes heavy jargon without definition, and heavily penalizes verbal crutches ("um", "uh", "like") if listening to audio.
    2. Structure Architect: Scores out of 25. Checks for a logical flow (e.g., High-level definition -> Trade-offs -> Conclusion).
    3. Depth Expert: Scores out of 25. Checks for accurate, deep technical keywords related to {concept['title']}.
    4. Brevity Critic: Scores out of 25. Penalizes rambling, repeating points, or taking too long.

    Output EXACTLY this JSON structure, with no markdown formatting:
    {{
        "clarity": int,
        "structure": int,
        "depth": int,
        "brevity": int,
        "feedback": "A 2-sentence overall critique summarizing the panel's thoughts."
    }}
    """

    model = genai.GenerativeModel('gemini-2.5-flash')
    
    try:
        if audio_path:
            # The Cheat Code: Upload the raw audio directly to the multimodal model
            print("Uploading audio to Gemini for direct evaluation...")
            audio_file = genai.upload_file(path=audio_path)
            response = model.generate_content(
                [system_prompt, audio_file, "Listen to the candidate's explanation and evaluate."],
                generation_config=genai.GenerationConfig(response_mime_type="application/json")
            )
            # Delete file from Google's servers after processing
            genai.delete_file(audio_file.name)
        else:
            response = model.generate_content(
                f"{system_prompt}\n\nThe candidate typed this answer:\n{text_answer}",
                generation_config=genai.GenerationConfig(response_mime_type="application/json")
            )

        # Parse JSON
        raw_text = response.text.strip()
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        
        agent_data = json.loads(raw_text.strip())
        
    except Exception as e:
        print(f"Agent Evaluation Error: {e}")
        # Fallback payload
        agent_data = {
            "clarity": 10, "structure": 10, "depth": 10, "brevity": 10,
            "feedback": "The multi-agent system experienced a network timeout."
        }

    # Calculate Totals & Game Mechanics
    total_score = agent_data["clarity"] + agent_data["structure"] + agent_data["depth"] + agent_data["brevity"]
    
    # As requested: We don't deduct lives if they do well. We ONLY deduct if they bomb it.
    life_consumed = total_score < 30
    
    # Base XP scaling
    xp_awarded = int((total_score / 100) * 200) if total_score >= 50 else 10

    return {
        "clarity": agent_data["clarity"],
        "structure": agent_data["structure"],
        "depth": agent_data["depth"],
        "brevity": agent_data["brevity"],
        "totalScore": total_score,
        "feedback": agent_data["feedback"],
        "xpAwarded": xp_awarded,
        "lifeConsumed": life_consumed
    }