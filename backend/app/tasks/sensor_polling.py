"""
Celery tasks for automatic sensor data polling and AI prediction generation.

These tasks run in the background to simulate periodic sensor readings
and generate failure predictions for in-progress inspections.
"""
import logging
from datetime import datetime
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.inspection import Inspection
from app.utils.sensor_simulator import simulate_sensor_data_for_inspection
from app.services import ai_prediction_service
from app.schemas.inspection import SensorDataCreate

logger = logging.getLogger(__name__)


def poll_sensors_and_predict():
    """
    Poll sensors for all in-progress inspections and generate predictions.

    This function:
    1. Finds all inspections with status 'in_progress'
    2. Simulates sensor data for each inspection
    3. Generates AI predictions based on the sensor data
    4. Stores results in the database

    This simulates real-world behavior where sensors continuously
    monitor asset conditions and predictions are automatically updated.
    """
    db: Session = SessionLocal()

    try:
        # Get all in-progress inspections
        from app.models.inspection import InspectionStatus
        in_progress_inspections = db.query(Inspection).filter(
            Inspection.status == InspectionStatus.in_progress
        ).all()

        logger.info(f"Polling sensors for {len(in_progress_inspections)} in-progress inspections")

        for inspection in in_progress_inspections:
            try:
                # Simulate sensor data collection
                sensor_readings = simulate_sensor_data_for_inspection(
                    inspection_id=inspection.id,
                    mode='random'  # Mix of normal, warning, and critical readings
                )

                # Create sensor data object
                sensor_data = SensorDataCreate(
                    pressure=sensor_readings.get('pressure'),
                    temperature=sensor_readings.get('temperature'),
                    wall_thickness=sensor_readings.get('wall_thickness'),
                    corrosion_rate=sensor_readings.get('corrosion_rate'),
                    vibration=sensor_readings.get('vibration'),
                    flow_rate=sensor_readings.get('flow_rate'),
                    notes=f"Automatic sensor reading at {datetime.utcnow().isoformat()}"
                )

                # Generate AI prediction
                sensor_db, prediction_db = ai_prediction_service.generate_ai_assessment(
                    db=db,
                    inspection_id=inspection.id,
                    sensor_data=sensor_data,
                    user_id=inspection.primary_inspector_id or 1  # Use inspector or system user
                )

                logger.info(
                    f"Generated prediction for inspection {inspection.id}: "
                    f"PoF={prediction_db.probability_of_failure}%, "
                    f"CoF={prediction_db.consequence_of_failure.value}, "
                    f"Priority={prediction_db.priority.value}"
                )

                # Check if critical condition detected
                if prediction_db.priority.value == 'critical':
                    logger.warning(
                        f"CRITICAL CONDITION detected for inspection {inspection.id}! "
                        f"Asset: {inspection.asset_id}, "
                        f"Recommendation: {prediction_db.recommended_action}"
                    )
                    # TODO: Trigger escalation/notification here

            except Exception as e:
                logger.error(
                    f"Failed to process inspection {inspection.id}: {str(e)}",
                    exc_info=True
                )
                continue

        logger.info(f"Sensor polling completed for {len(in_progress_inspections)} inspections")

    except Exception as e:
        logger.error(f"Sensor polling task failed: {str(e)}", exc_info=True)

    finally:
        db.close()


# Manual trigger function for testing
def trigger_sensor_poll_for_inspection(inspection_id: int):
    """
    Manually trigger sensor polling for a specific inspection.

    Useful for testing or on-demand predictions.

    Args:
        inspection_id: ID of the inspection to poll
    """
    db: Session = SessionLocal()

    try:
        inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()

        if not inspection:
            logger.error(f"Inspection {inspection_id} not found")
            return None

        if inspection.status.value != 'in_progress':
            logger.warning(f"Inspection {inspection_id} is not in progress (status: {inspection.status.value})")
            return None

        # Simulate sensor data
        sensor_readings = simulate_sensor_data_for_inspection(
            inspection_id=inspection.id,
            mode='random'
        )

        # Create sensor data object
        sensor_data = SensorDataCreate(
            pressure=sensor_readings.get('pressure'),
            temperature=sensor_readings.get('temperature'),
            wall_thickness=sensor_readings.get('wall_thickness'),
            corrosion_rate=sensor_readings.get('corrosion_rate'),
            vibration=sensor_readings.get('vibration'),
            flow_rate=sensor_readings.get('flow_rate'),
            notes=f"Manual trigger at {datetime.utcnow().isoformat()}"
        )

        # Generate prediction
        sensor_db, prediction_db = ai_prediction_service.generate_ai_assessment(
            db=db,
            inspection_id=inspection.id,
            sensor_data=sensor_data,
            user_id=inspection.primary_inspector_id or 1
        )

        logger.info(f"Manual prediction generated for inspection {inspection_id}")

        return {
            'sensor_data': sensor_db,
            'prediction': prediction_db
        }

    except Exception as e:
        logger.error(f"Manual trigger failed for inspection {inspection_id}: {str(e)}", exc_info=True)
        return None

    finally:
        db.close()
