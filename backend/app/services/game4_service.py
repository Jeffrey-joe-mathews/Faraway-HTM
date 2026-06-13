import json
import os
import google.generativeai as genai
# Import your LLM client here (e.g., google.generativeai, groq, etc.)
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

# Fast, hardcoded questions for the demo to prevent latency on load
DEMO_QUESTIONS = {
    "q1": {
        "id": "q1", "type": "mcq", "category": "Databases", "difficulty": "medium",
        "questionText": "If you have a 10TB database and need to migrate it to a new schema with zero downtime, what is the most critical first step?",
        "options": [
            {"id": "a", "text": "Take a full backup and lock the tables."},
            {"id": "b", "text": "Create a dual-write mechanism."},
            {"id": "c", "text": "Setup logical replication to a new instance."},
            {"id": "d", "text": "Write a background script to update rows in batches."}
        ],
        "correct_id": "c", "trap_id": "d"
    },
    "q2": {
        "id": "q2", "type": "mcq", "category": "System Design", "difficulty": "boss",
        "questionText": "The Final Googly: You are designing a globally distributed counter. A network partition occurs. Do you prioritize Availability or Consistency?",
        "options": [
            {"id": "a", "text": "Availability, users need to see a number."},
            {"id": "b", "text": "Consistency, financial data requires it."},
            {"id": "c", "text": "Neither, CAP theorem forces a tradeoff that degrades both."},
            {"id": "d", "text": "CP systems fall back to AP to preserve uptime."}
        ],
        "correct_id": "c", "trap_id": "d"
    }
}

def initialize_game():
    return {
        "totalRounds": len(DEMO_QUESTIONS),
        "startingRating": 50
    }

def fetch_question(round_num):
    q_key = f"q{round_num}"
    if q_key not in DEMO_QUESTIONS:
        return None
    
    q_data = DEMO_QUESTIONS[q_key].copy()
    # Strip out the answers before sending to frontend!
    q_data.pop("correct_id", None)
    q_data.pop("trap_id", None)
    return q_data

def evaluate_with_agent(question_id, selected_option, confidence_bet, current_rating):
    question = DEMO_QUESTIONS.get(question_id)
    if not question:
        raise ValueError("Invalid question ID")

    # Get the actual text of what the user selected
    selected_text = next((opt['text'] for opt in question['options'] if opt['id'] == selected_option), "Unknown")
    
    # Mathematical ground truth (we still use the hardcoded IDs to strictly calculate points)
    is_correct = selected_option == question["correct_id"]
    is_trap = selected_option == question.get("trap_id")

    # ---------------------------------------------------------
    # LIVE AI AGENT EVALUATION
    # ---------------------------------------------------------
    prompt = f"""
    You are the "Googly Master", an elite, slightly ruthless Tech Lead interviewing a candidate.
    
    The Question: "{question['questionText']}"
    The Candidate Chose: "{selected_text}"
    
    Context for you: This answer is strictly {'CORRECT' if is_correct else 'INCORRECT'}. 
    {'This was a TRAP option.' if is_trap else ''}
    
    Your task is to generate feedback.
    1. 'trapExplanation': If they hit a trap, explain in 2 sentences why it looked right but is technically disastrous. If they got it right, praise their system design thinking in 1 sentence.
    2. 'playerInsight': A harsh but fair 1-sentence critique or compliment of their architectural understanding.
    
    Output ONLY a valid JSON object matching this schema exactly:
    {{
        "trapExplanation": "string",
        "playerInsight": "string"
    }}
    """

    # try:
    #     # Using Gemini 1.5 Flash for high-speed game loops
    #     model = genai.GenerativeModel('gemini-1.5-flash')
    #     response = model.generate_content(
    #         prompt,
    #         generation_config=genai.GenerationConfig(
    #             response_mime_type="application/json"
    #         )
    #     )
    #     ai_data = json.loads(response.text)
    # except Exception as e:
    #     print(f"LLM Error: {e}")
    #     # Fallback just in case the API rate limits during your demo
    #     ai_data = {
    #         "trapExplanation": "The system architecture evaluation failed to load, but your choice was logged.",
    #         "playerInsight": "Network timeout during AI evaluation."
    #     }
    try:
        # Check if Python is actually seeing your key
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("Python cannot find the GOOGLE_API_KEY environment variable. It is completely missing.")

        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        
        # Clean the text just in case Gemini wraps it in ```json markdown
        raw_text = response.text.strip()
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        
        ai_data = json.loads(raw_text.strip())
        print("AI Evaluation Successful!")
        
    except Exception as e:
        print("\n" + "="*40)
        print("🚨 CRITICAL AI ERROR 🚨")
        print(f"Details: {str(e)}")
        print("="*40 + "\n")
        
        # Fallback
        ai_data = {
            "trapExplanation": "The system architecture evaluation failed to load, but your choice was logged.",
            "playerInsight": "Network timeout during AI evaluation."
        }

    # Math Logic (Unchanged)
    bonus = 50 if (confidence_bet == 3 and is_correct) else 0
    delta = 15 if is_correct else (-20 if is_trap else -5)
    
    return {
        "correctOptionId": question["correct_id"],
        "trapOptionId": question.get("trap_id") if is_trap else None,
        "isCorrect": is_correct,
        "isTrap": is_trap,
        "trapExplanation": ai_data.get("trapExplanation", ""),
        "playerInsight": ai_data.get("playerInsight", ""),
        "ratingDelta": delta,
        "newRating": max(0, min(100, current_rating + delta)),
        "confidenceBonus": bonus,
        "totalXpAwarded": (100 if is_correct else 10) + bonus
    }

def generate_lifeline(question_id, lifeline_type):
    question = DEMO_QUESTIONS.get(question_id)
    
    if lifeline_type == '50_50':
        # Return two incorrect IDs that are NOT the correct answer
        all_ids = [opt['id'] for opt in question['options']]
        wrong_ids = [i for i in all_ids if i != question['correct_id']]
        return {"eliminated": wrong_ids[:2]}
        
    elif lifeline_type == 'hint':
        # You could also use an LLM here to generate a dynamic hint!
        return {"hintText": "Don't fall for the obvious answer. Think about edge cases under heavy load."}