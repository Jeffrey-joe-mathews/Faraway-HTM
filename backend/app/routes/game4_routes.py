from flask import Blueprint, request, jsonify
from app.controllers import game4_controller

game4_bp = Blueprint('game4_routes', __name__, url_prefix='/api/game4')

@game4_bp.route('/start', methods=['POST'])
def start_game():
    # Called when the user clicks 'Play'
    return game4_controller.start_session()

@game4_bp.route('/question/<int:round_num>', methods=['GET'])
def get_question(round_num):
    # Fetches the specific question for the round
    return game4_controller.get_question_for_round(round_num)

@game4_bp.route('/evaluate', methods=['POST'])
def evaluate_answer():
    # The core AI Agent endpoint: takes the answer and grades it
    data = request.get_json()
    return game4_controller.evaluate_player_answer(data)

@game4_bp.route('/lifeline', methods=['POST'])
def use_lifeline():
    # Returns AI hints or 50/50 eliminations
    data = request.get_json()
    return game4_controller.process_lifeline(data)