import unittest
import os
import tempfile
from pathlib import Path
from core.credit_manager import AICreditManager, DEFAULT_DAILY_LIMIT, MAX_RPM


class TestCreditManager(unittest.TestCase):
    def setUp(self):
        self.orig_env = os.environ.get("AI_DAILY_CREDIT_LIMIT")
        self.temp_dir = tempfile.TemporaryDirectory()
        self.test_storage = Path(self.temp_dir.name) / "test_usage.json"

    def tearDown(self):
        if self.orig_env is not None:
            os.environ["AI_DAILY_CREDIT_LIMIT"] = self.orig_env
        else:
            os.environ.pop("AI_DAILY_CREDIT_LIMIT", None)
        self.temp_dir.cleanup()

    def _get_manager(self) -> AICreditManager:
        return AICreditManager(storage_file=self.test_storage)

    def test_credit_manager_initial_state(self):
        os.environ["AI_DAILY_CREDIT_LIMIT"] = "5"
        manager = self._get_manager()

        info = manager.get_credit_info()
        self.assertEqual(info["limit"], 5)
        self.assertEqual(info["used"], 0)
        self.assertEqual(info["remaining"], 5)
        self.assertFalse(info["isLimitReached"])
        self.assertFalse(info["quotaExhausted"])

        can_proceed, reason = manager.can_consume()
        self.assertTrue(can_proceed)
        self.assertEqual(reason, "")

    def test_credit_manager_consumption_limit(self):
        os.environ["AI_DAILY_CREDIT_LIMIT"] = "2"
        manager = self._get_manager()

        # Consume 1
        manager.record_usage()
        self.assertEqual(manager.get_credit_info()["used"], 1)
        self.assertEqual(manager.get_credit_info()["remaining"], 1)
        self.assertTrue(manager.can_consume()[0])

        # Consume 2 (at limit)
        manager.record_usage()
        info = manager.get_credit_info()
        self.assertEqual(info["used"], 2)
        self.assertEqual(info["remaining"], 0)
        self.assertTrue(info["isLimitReached"])

        # Check that can_consume is blocked
        can_proceed, reason = manager.can_consume()
        self.assertFalse(can_proceed)
        self.assertIn("Daily free credit limit reached", reason)

    def test_credit_manager_quota_exhausted(self):
        manager = self._get_manager()

        manager.mark_quota_exhausted("429 RESOURCE_EXHAUSTED")
        info = manager.get_credit_info()
        self.assertTrue(info["quotaExhausted"])
        self.assertTrue(info["isLimitReached"])
        self.assertEqual(info["mode"], "free_tier_fallback")

        can_proceed, reason = manager.can_consume()
        self.assertFalse(can_proceed)
        self.assertIn("quota exhausted", reason.lower())

        # Reset
        manager.reset_credits()
        self.assertTrue(manager.can_consume()[0])
        self.assertFalse(manager.get_credit_info()["quotaExhausted"])

    def test_credit_manager_rate_limit_rpm(self):
        os.environ["AI_DAILY_CREDIT_LIMIT"] = "100"
        manager = self._get_manager()

        # Simulate reaching MAX_RPM requests within the current minute
        for _ in range(MAX_RPM):
            can_proceed, _ = manager.can_consume()
            self.assertTrue(can_proceed)
            manager.record_usage()

        # Next request must be throttled by RPM limit
        can_proceed, reason = manager.can_consume()
        self.assertFalse(can_proceed)
        self.assertIn("Rate limit reached", reason)


if __name__ == "__main__":
    unittest.main()
