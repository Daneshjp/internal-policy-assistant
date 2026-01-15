"""
Background scheduler for periodic tasks.

Runs sensor polling every 15 minutes for all in-progress inspections.
"""
import logging
import time
import threading
from datetime import datetime

from app.tasks.sensor_polling import poll_sensors_and_predict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Polling interval in seconds (15 minutes = 900 seconds)
POLLING_INTERVAL = 900  # 15 minutes


class SensorPollingScheduler:
    """
    Background scheduler that runs sensor polling tasks at regular intervals.
    """

    def __init__(self, interval: int = POLLING_INTERVAL):
        """
        Initialize scheduler.

        Args:
            interval: Polling interval in seconds (default: 900 = 15 minutes)
        """
        self.interval = interval
        self.running = False
        self.thread = None

    def _run(self):
        """Internal method that runs the polling loop."""
        logger.info(f"Sensor polling scheduler started (interval: {self.interval}s / {self.interval/60}min)")

        while self.running:
            try:
                logger.info(f"Starting sensor poll cycle at {datetime.utcnow().isoformat()}")
                poll_sensors_and_predict()
                logger.info(f"Sensor poll cycle completed at {datetime.utcnow().isoformat()}")

            except Exception as e:
                logger.error(f"Error in sensor polling cycle: {str(e)}", exc_info=True)

            # Wait for next interval
            if self.running:
                logger.info(f"Next sensor poll in {self.interval}s ({self.interval/60}min)")
                time.sleep(self.interval)

        logger.info("Sensor polling scheduler stopped")

    def start(self):
        """Start the scheduler in a background thread."""
        if self.running:
            logger.warning("Scheduler is already running")
            return

        self.running = True
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()
        logger.info("Sensor polling scheduler thread started")

    def stop(self):
        """Stop the scheduler."""
        if not self.running:
            logger.warning("Scheduler is not running")
            return

        logger.info("Stopping sensor polling scheduler...")
        self.running = False

        if self.thread:
            self.thread.join(timeout=5)

        logger.info("Sensor polling scheduler stopped")


# Global scheduler instance
_scheduler = None


def start_scheduler(interval: int = POLLING_INTERVAL):
    """
    Start the global sensor polling scheduler.

    Args:
        interval: Polling interval in seconds (default: 900 = 15 minutes)
    """
    global _scheduler

    if _scheduler is not None:
        logger.warning("Scheduler already exists")
        return

    _scheduler = SensorPollingScheduler(interval=interval)
    _scheduler.start()


def stop_scheduler():
    """Stop the global sensor polling scheduler."""
    global _scheduler

    if _scheduler is None:
        logger.warning("No scheduler to stop")
        return

    _scheduler.stop()
    _scheduler = None


def get_scheduler() -> SensorPollingScheduler:
    """Get the global scheduler instance."""
    return _scheduler
