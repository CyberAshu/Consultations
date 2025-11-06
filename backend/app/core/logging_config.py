"""
Logging configuration for the application.
Creates separate log files for different concerns.
"""
import logging
import os
from pathlib import Path
from logging.handlers import RotatingFileHandler
from datetime import datetime

# Create logs directory if it doesn't exist
LOGS_DIR = Path("logs")
LOGS_DIR.mkdir(exist_ok=True)

# Log file paths
AVAILABILITY_LOG = LOGS_DIR / "availability.log"
API_LOG = LOGS_DIR / "api.log"
ERROR_LOG = LOGS_DIR / "errors.log"


def setup_logger(name: str, log_file: Path, level=logging.INFO):
    """
    Set up a logger with file and console handlers.
    
    Args:
        name: Logger name
        log_file: Path to log file
        level: Logging level
    
    Returns:
        Configured logger
    """
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Avoid adding handlers multiple times
    if logger.handlers:
        return logger
    
    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # File handler with rotation (10MB max, keep 5 backups)
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setLevel(level)
    file_handler.setFormatter(detailed_formatter)
    
    # Console handler (only show INFO and above)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter(
        '%(levelname)s: %(message)s'
    )
    console_handler.setFormatter(console_formatter)
    
    # Add handlers
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger


# Create specific loggers
availability_logger = setup_logger('availability', AVAILABILITY_LOG, logging.DEBUG)
api_logger = setup_logger('api', API_LOG, logging.INFO)
error_logger = setup_logger('errors', ERROR_LOG, logging.ERROR)


def log_availability_creation(consultant_id: int, slot_data: dict, saved_slot: dict = None):
    """Log availability slot creation."""
    if saved_slot:
        availability_logger.info(
            f"Slot created - Consultant: {consultant_id} | "
            f"Day: {saved_slot.get('day_of_week')} | "
            f"Time: {saved_slot.get('start_time')}-{saved_slot.get('end_time')} | "
            f"Timezone: {saved_slot.get('timezone')} | "
            f"ID: {saved_slot.get('id')}"
        )
    else:
        availability_logger.debug(
            f"Creating slot - Consultant: {consultant_id} | "
            f"Day: {slot_data.get('day_of_week')} | "
            f"Time: {slot_data.get('start_time')}-{slot_data.get('end_time')} | "
            f"Timezone: {slot_data.get('timezone')}"
        )


def log_slot_fetch(consultant_id: int, date: str, client_tz: str, slots_found: int):
    """Log available slots fetch."""
    availability_logger.info(
        f"Slots fetched - Consultant: {consultant_id} | "
        f"Date: {date} | Client TZ: {client_tz} | "
        f"Found: {slots_found} slots"
    )


def log_timezone_conversion(consultant_tz: str, client_tz: str, sample_time: str = None):
    """Log timezone conversion details."""
    msg = f"TZ Conversion - {consultant_tz} → {client_tz}"
    if sample_time:
        msg += f" | Sample: {sample_time}"
    availability_logger.debug(msg)


def log_api_request(endpoint: str, method: str, user_id: str = None):
    """Log API requests."""
    user_info = f"User: {user_id}" if user_id else "Anonymous"
    api_logger.info(f"{method} {endpoint} | {user_info}")


def log_error(context: str, error: Exception):
    """Log errors with context."""
    error_logger.error(f"{context} | {type(error).__name__}: {str(error)}", exc_info=True)
