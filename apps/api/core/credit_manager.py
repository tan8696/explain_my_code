import os
import json
import time
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Tuple

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
USAGE_FILE = DATA_DIR / "usage.json"
DEFAULT_DAILY_LIMIT = 50
MAX_RPM = 15  # Gemini Free Tier limit: 15 requests per minute


class AICreditManager:
    """Thread-safe persistent credit manager and rate limiter.
    Ensures Gemini API usage stays strictly within free-tier limits
    and persists across server restarts.
    """

    def __init__(self, storage_file: Path | None = None):
        self._lock = threading.Lock()
        self._recent_requests: list[float] = []
        self._storage_file = storage_file or USAGE_FILE
        self._storage_file.parent.mkdir(parents=True, exist_ok=True)
        self._state = self._load_state()

    def _get_configured_limit(self) -> int:
        try:
            return int(os.getenv("AI_DAILY_CREDIT_LIMIT", str(DEFAULT_DAILY_LIMIT)))
        except ValueError:
            return DEFAULT_DAILY_LIMIT

    def _today_utc(self) -> str:
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")

    def _load_state(self) -> Dict[str, Any]:
        today = self._today_utc()
        limit = self._get_configured_limit()

        if self._storage_file.exists():
            try:
                with open(self._storage_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                if data.get("date") == today:
                    data["limit"] = limit
                    return data
            except Exception:
                pass

        # Default new state for today
        new_state = {
            "date": today,
            "used": 0,
            "limit": limit,
            "quotaExhausted": False,
            "exhaustedReason": "",
        }
        self._save_state(new_state)
        return new_state

    def _save_state(self, state: Dict[str, Any]):
        try:
            self._storage_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self._storage_file, "w", encoding="utf-8") as f:
                json.dump(state, f, indent=2)
        except Exception:
            pass

    def _sync_state(self):
        """Ensure state is synced with storage file and current UTC date."""
        today = self._today_utc()
        limit = self._get_configured_limit()

        if self._storage_file.exists():
            try:
                with open(self._storage_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                if data.get("date") == today:
                    data["limit"] = limit
                    self._state = data
                    return
            except Exception:
                pass

        if self._state.get("date") != today:
            self._state = {
                "date": today,
                "used": 0,
                "limit": limit,
                "quotaExhausted": False,
                "exhaustedReason": "",
            }
            self._recent_requests.clear()
            self._save_state(self._state)
        else:
            self._state["limit"] = limit

    def can_consume(self) -> Tuple[bool, str]:
        """Check if an AI request can proceed without exceeding limits."""
        with self._lock:
            self._sync_state()
            limit = self._get_configured_limit()
            self._state["limit"] = limit

            # Check if upstream API reported quota exhaustion today
            if self._state.get("quotaExhausted", False):
                reason = self._state.get("exhaustedReason") or "Upstream Gemini quota exhausted for today."
                return False, reason

            # Check daily credit limit
            if self._state["used"] >= limit:
                return False, f"Daily free credit limit reached ({self._state['used']}/{limit} requests)."

            # Check requests-per-minute (RPM) sliding window
            now = time.time()
            self._recent_requests = [t for t in self._recent_requests if now - t < 60]
            if len(self._recent_requests) >= MAX_RPM:
                return False, f"Rate limit reached ({MAX_RPM} req/min). Please wait a moment."

            return True, ""

    def record_usage(self) -> Dict[str, Any]:
        """Record 1 consumed AI request credit."""
        with self._lock:
            self._sync_state()
            self._state["used"] = self._state.get("used", 0) + 1
            self._recent_requests.append(time.time())
            self._save_state(self._state)
            return self._format_credit_info()

    def mark_quota_exhausted(self, reason: str = "Google Gemini free tier 429 quota exhausted"):
        """Flag that upstream API returned quota exhaustion, protecting future calls."""
        with self._lock:
            self._sync_state()
            self._state["quotaExhausted"] = True
            clean_reason = reason.strip() if reason else "429 Quota Exceeded"
            if "quota exhausted" not in clean_reason.lower():
                clean_reason = f"Upstream Gemini quota exhausted: {clean_reason}"
            self._state["exhaustedReason"] = clean_reason
            self._save_state(self._state)

    def get_credit_info(self) -> Dict[str, Any]:
        """Get current credit balance and rate limit state."""
        with self._lock:
            self._sync_state()
            limit = self._get_configured_limit()
            self._state["limit"] = limit
            return self._format_credit_info()

    def reset_credits(self) -> Dict[str, Any]:
        """Reset daily credits (for testing/development)."""
        with self._lock:
            today = self._today_utc()
            self._state = {
                "date": today,
                "used": 0,
                "limit": self._get_configured_limit(),
                "quotaExhausted": False,
                "exhaustedReason": "",
            }
            self._recent_requests.clear()
            self._save_state(self._state)
            return self._format_credit_info()

    def _format_credit_info(self) -> Dict[str, Any]:
        limit = self._state.get("limit", DEFAULT_DAILY_LIMIT)
        used = self._state.get("used", 0)
        remaining = max(0, limit - used)
        quota_exhausted = self._state.get("quotaExhausted", False)
        is_limit_reached = (used >= limit) or quota_exhausted

        if quota_exhausted:
            mode = "free_tier_fallback"
        elif is_limit_reached:
            mode = "limit_reached_fallback"
        else:
            mode = "gemini_live"

        return {
            "limit": limit,
            "used": used,
            "remaining": remaining,
            "isLimitReached": is_limit_reached,
            "quotaExhausted": quota_exhausted,
            "reason": self._state.get("exhaustedReason", ""),
            "mode": mode,
            "resetAt": "Midnight UTC",
        }


# Global singleton instance
credit_manager = AICreditManager()
