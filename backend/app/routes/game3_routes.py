from flask import Blueprint, request
from app.controllers import game3_controller

game3_bp = Blueprint('game3_routes', __name__, url_prefix='/api/game3')

@game3_bp.route('/start', methods=['POST'])
def start():
    return game3_controller.start_session()

@game3_bp.route('/evaluate', methods=['POST'])
def evaluate():
    # Frontend sends multipart/form-data for audio, JSON for text
    if request.content_type and 'multipart/form-data' in request.content_type:
        return game3_controller.evaluate_audio(request)
    else:
        return game3_controller.evaluate_text(request.get_json())
@game3_bp.route('/next-card', methods=['POST'])
def next_card():
    return game3_controller.get_next_card(request.get_json() or {})