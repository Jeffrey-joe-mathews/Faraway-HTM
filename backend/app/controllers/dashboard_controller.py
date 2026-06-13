from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.services.dashboard_service import get_dashboard_overview, get_dashboard_profile, save_dashboard_profile, record_activity


@jwt_required()
def overview():
    user_id = get_jwt_identity()
    dashboard = get_dashboard_overview(user_id)
    if not dashboard:
        return jsonify({"message": "User not found"}), 404
    return jsonify(dashboard), 200


@jwt_required()
def profile():
    user_id = get_jwt_identity()
    dashboard_profile = get_dashboard_profile(user_id)
    if not dashboard_profile:
        return jsonify({"message": "Dashboard profile not found"}), 404
    return jsonify({"profile": dashboard_profile}), 200


@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    payload = request.get_json(silent=True) or {}

    result = save_dashboard_profile(
        user_id,
        {
            "goal": payload.get("goal", ""),
            "user_type": payload.get("userType", payload.get("user_type", "")),
            "problems": payload.get("problems", []),
            "streak_days": payload.get("streakDays", payload.get("streak_days")),
            "arena_points": payload.get("arenaPoints", payload.get("arena_points")),
            "completed_games": payload.get("completedGames", payload.get("completed_games")),
            "weekly_progress": payload.get("weeklyProgress", payload.get("weekly_progress")),
            "leaderboard_rank": payload.get("leaderboardRank", payload.get("leaderboard_rank")),
        },
    )
    return jsonify({"profile": result}), 200


@jwt_required()
def activity():
    user_id = get_jwt_identity()
    payload = request.get_json(silent=True) or {}
    result = record_activity(
        user_id,
        {
            "game_key": payload.get("gameKey", payload.get("game_key", "")),
            "title": payload.get("title", ""),
            "summary": payload.get("summary", ""),
            "score": payload.get("score", 0),
            "points_awarded": payload.get("pointsAwarded", payload.get("points_awarded", 0)),
            "focus_areas": payload.get("focusAreas", payload.get("focus_areas", [])),
        },
    )
    if not result:
        return jsonify({"message": "Unable to record activity"}), 400
    return jsonify({"profile": result}), 200
