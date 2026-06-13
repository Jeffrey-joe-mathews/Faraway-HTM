from datetime import datetime

from app.services.db_service import get_db


def _dashboard_collection():
    return get_db()["dashboard_profiles"]


def _dashboard_sessions_collection():
    return get_db()["dashboard_sessions"]


def serialize_dashboard_profile(profile: dict) -> dict:
    return {
        "user_id": profile["user_id"],
        "goal": profile.get("goal", ""),
        "user_type": profile.get("user_type", ""),
        "problems": profile.get("problems", []),
        "streak_days": int(profile.get("streak_days", 0)),
        "arena_points": int(profile.get("arena_points", 0)),
        "completed_games": int(profile.get("completed_games", 0)),
        "weekly_goal_sessions": int(profile.get("weekly_goal_sessions", 5)),
        "weekly_progress": int(profile.get("weekly_progress", 0)),
        "created_at": profile.get("created_at").isoformat() if profile.get("created_at") else None,
        "updated_at": profile.get("updated_at").isoformat() if profile.get("updated_at") else None,
        "last_activity_at": profile.get("last_activity_at").isoformat() if profile.get("last_activity_at") else None,
        "focus_areas": profile.get("focus_areas", []),
        "recent_sessions": profile.get("recent_sessions", []),
    }


def find_profile_by_user_id(user_id: str):
    return _dashboard_collection().find_one({"user_id": user_id})


def find_recent_sessions(user_id: str, limit: int = 5):
    cursor = _dashboard_sessions_collection().find({"user_id": user_id}).sort("completed_at", -1).limit(limit)
    sessions = []
    for session in cursor:
        sessions.append(
            {
                "game_key": session.get("game_key", ""),
                "title": session.get("title", ""),
                "summary": session.get("summary", ""),
                "score": int(session.get("score", 0) or 0),
                "points_awarded": int(session.get("points_awarded", 0) or 0),
                "focus_areas": session.get("focus_areas", []),
                "completed_at": session.get("completed_at").isoformat() if session.get("completed_at") else None,
            }
        )
    return sessions


def upsert_profile(user_id: str, profile_data: dict):
    now = datetime.utcnow()
    existing = find_profile_by_user_id(user_id) or {}

    def _text(value, fallback: str = "") -> str:
        if value is None:
            return str(fallback).strip()
        return str(value).strip()

    def _int(value, fallback: int) -> int:
        if value is None or value == "":
            return int(fallback)
        return int(value)

    def _list(value, fallback: list[str]) -> list[str]:
        source = fallback if value is None else value
        return [str(problem).strip() for problem in source if str(problem).strip()]

    profile = {
        "user_id": user_id,
        "goal": _text(profile_data.get("goal"), existing.get("goal", "")),
        "user_type": _text(profile_data.get("user_type"), existing.get("user_type", "")),
        "problems": _list(profile_data.get("problems"), existing.get("problems", [])),
        "focus_areas": _list(profile_data.get("focus_areas"), existing.get("focus_areas", existing.get("problems", []))),
        "streak_days": _int(profile_data.get("streak_days"), existing.get("streak_days", 0) or 0),
        "arena_points": _int(profile_data.get("arena_points"), existing.get("arena_points", 0) or 0),
        "completed_games": _int(profile_data.get("completed_games"), existing.get("completed_games", 0) or 0),
        "weekly_goal_sessions": _int(profile_data.get("weekly_goal_sessions"), existing.get("weekly_goal_sessions", 5) or 5),
        "weekly_progress": _int(profile_data.get("weekly_progress"), existing.get("weekly_progress", 0) or 0),
        "recent_sessions": profile_data.get("recent_sessions", existing.get("recent_sessions", [])),
        "last_activity_at": profile_data.get("last_activity_at", existing.get("last_activity_at")),
        "updated_at": now,
    }

    if not existing:
        profile["created_at"] = now
        _dashboard_collection().insert_one(profile)
    else:
        _dashboard_collection().update_one({"user_id": user_id}, {"$set": profile}, upsert=True)

    return find_profile_by_user_id(user_id)


def record_game_session(user_id: str, session_data: dict):
    now = datetime.utcnow()
    existing = find_profile_by_user_id(user_id) or {}
    current_focus = existing.get("focus_areas") or existing.get("problems") or []

    points_awarded = int(session_data.get("points_awarded", 0) or 0)
    arena_points = int(existing.get("arena_points", 0) or 0) + points_awarded
    completed_games = int(existing.get("completed_games", 0) or 0) + 1
    weekly_goal_sessions = int(existing.get("weekly_goal_sessions", 5) or 5)
    weekly_progress = min(100, round((completed_games / max(weekly_goal_sessions, 1)) * 100))

    prev_activity = existing.get("last_activity_at")
    if isinstance(prev_activity, datetime):
        day_gap = (now.date() - prev_activity.date()).days
        previous_streak = int(existing.get("streak_days", 0) or 0)
        if day_gap == 0:
            streak_days = max(1, previous_streak)
        elif day_gap == 1:
            streak_days = previous_streak + 1 if previous_streak > 0 else 1
        else:
            streak_days = 1
    else:
        streak_days = max(1, int(existing.get("streak_days", 0) or 0)) or 1

    next_focus = [str(item).strip() for item in session_data.get("focus_areas", []) if str(item).strip()]
    merged_focus = list(dict.fromkeys([*next_focus, *current_focus]))

    session_document = {
        "user_id": user_id,
        "game_key": session_data.get("game_key", ""),
        "title": session_data.get("title", ""),
        "summary": session_data.get("summary", ""),
        "score": int(session_data.get("score", 0) or 0),
        "points_awarded": points_awarded,
        "focus_areas": next_focus,
        "completed_at": now,
        "created_at": now,
    }
    _dashboard_sessions_collection().insert_one(session_document)

    recent_sessions = find_recent_sessions(user_id, limit=5)

    profile_update = {
        "arena_points": arena_points,
        "completed_games": completed_games,
        "weekly_goal_sessions": weekly_goal_sessions,
        "weekly_progress": weekly_progress,
        "streak_days": streak_days,
        "focus_areas": merged_focus,
        "recent_sessions": recent_sessions,
        "last_activity_at": now,
        "updated_at": now,
    }

    if not existing:
        profile_update["created_at"] = now
        profile_update["user_id"] = user_id
        _dashboard_collection().insert_one({
            "user_id": user_id,
            "goal": "",
            "user_type": "",
            "problems": [],
            **profile_update,
        })
    else:
        _dashboard_collection().update_one({"user_id": user_id}, {"$set": profile_update}, upsert=True)

    return find_profile_by_user_id(user_id)
