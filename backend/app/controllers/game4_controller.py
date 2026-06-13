from flask import jsonify
from app.services import game4_service

def start_session():
    try:
        # In a real app, you'd save this to MongoDB. For the demo, we return the config.
        session_data = game4_service.initialize_game()
        return jsonify({"status": "success", "data": session_data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

def get_question_for_round(round_num):
    try:
        question = game4_service.fetch_question(round_num)
        if not question:
            return jsonify({"status": "error", "message": "Game Over"}), 404
        return jsonify({"status": "success", "data": question}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

def evaluate_player_answer(data):
    question_id = data.get('questionId')
    selected_option = data.get('selectedOptionId')
    confidence_bet = data.get('confidenceBet')
    current_rating = data.get('currentRating', 50)

    if not all([question_id, selected_option, confidence_bet]):
        return jsonify({"status": "error", "message": "Missing required fields"}), 400

    try:
        # Pass to the AI Service
        result = game4_service.evaluate_with_agent(
            question_id, selected_option, confidence_bet, current_rating
        )
        return jsonify({"status": "success", "data": result}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

def process_lifeline(data):
    lifeline_type = data.get('type')  # '50_50' or 'hint'
    question_id = data.get('questionId')

    try:
        result = game4_service.generate_lifeline(question_id, lifeline_type)
        return jsonify({"status": "success", "data": result}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500