from app.models.dashboard_model import find_profile_by_user_id, find_recent_sessions, record_game_session, serialize_dashboard_profile, upsert_profile
from app.models.user_model import find_user_by_id, serialize_user


def _build_games():
    return [
        {"title": "Coffee with Interview Arena", "detail": "Start with a calm conversational round built for warm-up practice.", "meta": "10 min", "route": "/dashboard/game1", "icon": "book-open-check"},
        {"title": "Salary Negotiator Poker", "detail": "Play negotiation hands and practice confident compensation conversations.", "meta": "15 min", "route": "/dashboard/game2", "icon": "bar-chart-3"},
        {"title": "Articulate Master", "detail": "Sharpen clear answers, tighter structure, and polished interview delivery.", "meta": "12 min", "route": "/game3/session", "icon": "brain"},
        {"title": "GOOGLY MASTER", "detail": "Read tricky questions, spot the trap, and lock in your confidence bet.", "meta": "20 min", "route": "/game4/session", "icon": "gamepad-2"},
    ]


def _build_leaderboard(current_user_name: str, current_user_points: int):
    rows = [
        {"rank": 1, "name": "Aarav Singh", "points": 2840},
        {"rank": 2, "name": "Maya Chen", "points": 2620},
        {"rank": 3, "name": "Noah Patel", "points": 2410},
    ]
    rows.append({"rank": 4, "name": current_user_name, "points": current_user_points, "is_current_user": True})
    return rows


def _normalize_profile_snapshot(profile_data: dict) -> dict:
    snapshot = dict(profile_data)
    if not snapshot.get("recent_sessions") and not snapshot.get("last_activity_at"):
        snapshot["streak_days"] = 0
        snapshot["arena_points"] = 0
        snapshot["completed_games"] = 0
        snapshot["weekly_progress"] = 0
        snapshot["focus_areas"] = snapshot.get("focus_areas") or snapshot.get("problems") or []
    return snapshot


def save_dashboard_profile(user_id: str, profile_data: dict):
    profile = upsert_profile(user_id, profile_data)
    return _normalize_profile_snapshot(serialize_dashboard_profile(profile))


def get_dashboard_profile(user_id: str):
    profile = find_profile_by_user_id(user_id)
    if not profile:
        return None
    return _normalize_profile_snapshot(serialize_dashboard_profile(profile))


def get_dashboard_overview(user_id: str):
    user = find_user_by_id(user_id)
    if not user:
        return None

    profile = find_profile_by_user_id(user_id)
    if not profile:
        profile = upsert_profile(
            user_id,
            {
                "goal": "",
                "user_type": "",
                "problems": [],
            },
        )

    profile_data = _normalize_profile_snapshot(serialize_dashboard_profile(profile))
    user_data = serialize_user(user)

    focus_areas = profile_data["focus_areas"] or profile_data["problems"]
    current_points = profile_data["arena_points"]
    recent_sessions = find_recent_sessions(user_id, limit=5)

    if recent_sessions:
        next_session = []
        for item in recent_sessions[:3]:
            title = item.get("title") or "Recent session"
            summary = item.get("summary") or "Review your latest performance."
            next_session.append({"label": f"Review {title}", "detail": summary})
    else:
        next_session = [
            {"label": "Warm up", "detail": "Complete one focused session to establish a new baseline."},
            {"label": "Practice", "detail": "Work on your weakest focus area from onboarding."},
            {"label": "Review", "detail": "Check the latest feedback and adjust your next round."},
        ]

    return {
        "user": {
            **user_data,
            "goal": profile_data["goal"],
            "user_type": profile_data["user_type"],
            "problems": focus_areas,
        },
        "stats": {
            "streak_days": profile_data["streak_days"],
            "arena_points": current_points,
            "focus_area_count": len(focus_areas),
            "completed_games": profile_data["completed_games"],
            "weekly_progress": profile_data["weekly_progress"],
        },
        "focus_areas": focus_areas,
        "next_session": next_session,
        "games": _build_games(),
        "leaderboard": _build_leaderboard(user_data["name"], current_points),
        "profile": profile_data,
    }


def record_activity(user_id: str, session_data: dict):
    profile = record_game_session(user_id, session_data)
    if not profile:
        return None
    return _normalize_profile_snapshot(serialize_dashboard_profile(profile))
