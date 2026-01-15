"""
AI-powered failure prediction service.

This is a mock implementation using rule-based logic.
Ready for future integration with real ML models.
"""
import logging
import random
from decimal import Decimal
from typing import Tuple, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.inspection import (
    Inspection,
    SensorData,
    FailurePrediction,
    ConsequenceLevel,
    PriorityLevel
)
from app.schemas.inspection import SensorDataCreate

logger = logging.getLogger(__name__)


class MockAIPredictionEngine:
    """
    Mock AI prediction engine using rule-based logic.

    This simulates ML predictions for POC/MVP purposes.
    Can be replaced with real ML models in production.
    """

    # Threshold constants for rule-based logic
    THRESHOLDS = {
        'pressure': {'safe': 10, 'warning': 15, 'critical': 20},  # bar
        'temperature': {'safe': 80, 'warning': 100, 'critical': 120},  # Celsius
        'wall_thickness': {'safe': 10, 'warning': 7, 'critical': 5},  # mm (inverse)
        'corrosion_rate': {'safe': 0.1, 'warning': 0.3, 'critical': 0.5},  # mm/year
        'vibration': {'safe': 2.8, 'warning': 4.5, 'critical': 7.0},  # mm/s
        'flow_rate': {'safe': 50, 'warning': 80, 'critical': 100},  # m³/h
    }

    def calculate_pof(self, sensor_data: SensorDataCreate) -> Decimal:
        """
        Calculate Probability of Failure (PoF).

        Args:
            sensor_data: Sensor readings

        Returns:
            PoF percentage (0-100)
        """
        risk_scores = []

        # Pressure risk (higher is worse)
        if sensor_data.pressure is not None:
            pressure_val = float(sensor_data.pressure)
            if pressure_val >= self.THRESHOLDS['pressure']['critical']:
                risk_scores.append(90)
            elif pressure_val >= self.THRESHOLDS['pressure']['warning']:
                risk_scores.append(60)
            elif pressure_val >= self.THRESHOLDS['pressure']['safe']:
                risk_scores.append(30)
            else:
                risk_scores.append(10)

        # Temperature risk (higher is worse)
        if sensor_data.temperature is not None:
            temp_val = float(sensor_data.temperature)
            if temp_val >= self.THRESHOLDS['temperature']['critical']:
                risk_scores.append(85)
            elif temp_val >= self.THRESHOLDS['temperature']['warning']:
                risk_scores.append(55)
            elif temp_val >= self.THRESHOLDS['temperature']['safe']:
                risk_scores.append(25)
            else:
                risk_scores.append(5)

        # Wall thickness risk (lower is worse - inverse logic)
        if sensor_data.wall_thickness is not None:
            thickness_val = float(sensor_data.wall_thickness)
            if thickness_val <= self.THRESHOLDS['wall_thickness']['critical']:
                risk_scores.append(95)
            elif thickness_val <= self.THRESHOLDS['wall_thickness']['warning']:
                risk_scores.append(65)
            elif thickness_val <= self.THRESHOLDS['wall_thickness']['safe']:
                risk_scores.append(35)
            else:
                risk_scores.append(15)

        # Corrosion rate risk (higher is worse)
        if sensor_data.corrosion_rate is not None:
            corr_val = float(sensor_data.corrosion_rate)
            if corr_val >= self.THRESHOLDS['corrosion_rate']['critical']:
                risk_scores.append(88)
            elif corr_val >= self.THRESHOLDS['corrosion_rate']['warning']:
                risk_scores.append(58)
            elif corr_val >= self.THRESHOLDS['corrosion_rate']['safe']:
                risk_scores.append(28)
            else:
                risk_scores.append(8)

        # Vibration risk (higher is worse)
        if sensor_data.vibration is not None:
            vib_val = float(sensor_data.vibration)
            if vib_val >= self.THRESHOLDS['vibration']['critical']:
                risk_scores.append(80)
            elif vib_val >= self.THRESHOLDS['vibration']['warning']:
                risk_scores.append(50)
            elif vib_val >= self.THRESHOLDS['vibration']['safe']:
                risk_scores.append(20)
            else:
                risk_scores.append(5)

        # Flow rate risk (higher is worse)
        if sensor_data.flow_rate is not None:
            flow_val = float(sensor_data.flow_rate)
            if flow_val >= self.THRESHOLDS['flow_rate']['critical']:
                risk_scores.append(75)
            elif flow_val >= self.THRESHOLDS['flow_rate']['warning']:
                risk_scores.append(45)
            elif flow_val >= self.THRESHOLDS['flow_rate']['safe']:
                risk_scores.append(15)
            else:
                risk_scores.append(5)

        # Calculate weighted average (if no data, return low risk)
        if not risk_scores:
            return Decimal('15.00')

        avg_pof = sum(risk_scores) / len(risk_scores)

        # Add variability based on multiple critical parameters
        critical_count = sum(1 for score in risk_scores if score >= 75)
        if critical_count >= 3:
            avg_pof = min(95, avg_pof * 1.2)  # Boost by 20% if multiple critical
        elif critical_count >= 2:
            avg_pof = min(90, avg_pof * 1.1)  # Boost by 10% if two critical

        return Decimal(f'{avg_pof:.2f}')

    def calculate_cof(self, sensor_data: SensorDataCreate, pof: Decimal) -> str:
        """
        Calculate Consequence of Failure (CoF).

        Args:
            sensor_data: Sensor readings
            pof: Probability of failure

        Returns:
            CoF level: 'low', 'medium', 'high', 'critical'
        """
        # Base CoF on worst parameter condition and PoF
        cof_score = 0

        # Critical parameters boost CoF
        if sensor_data.pressure and float(sensor_data.pressure) >= self.THRESHOLDS['pressure']['critical']:
            cof_score += 3
        if sensor_data.temperature and float(sensor_data.temperature) >= self.THRESHOLDS['temperature']['critical']:
            cof_score += 3
        if sensor_data.wall_thickness and float(sensor_data.wall_thickness) <= self.THRESHOLDS['wall_thickness']['critical']:
            cof_score += 4  # Wall thickness is most critical
        if sensor_data.corrosion_rate and float(sensor_data.corrosion_rate) >= self.THRESHOLDS['corrosion_rate']['critical']:
            cof_score += 3

        # PoF influences CoF (high probability = high consequence)
        if float(pof) >= 80:
            cof_score += 2
        elif float(pof) >= 60:
            cof_score += 1

        # Determine CoF level
        if cof_score >= 8:
            return 'critical'
        elif cof_score >= 5:
            return 'high'
        elif cof_score >= 3:
            return 'medium'
        else:
            return 'low'

    def calculate_confidence(self, sensor_data: SensorDataCreate) -> Decimal:
        """
        Calculate confidence score based on data completeness.

        Args:
            sensor_data: Sensor readings

        Returns:
            Confidence percentage (0-100)
        """
        # Count available parameters
        total_params = 6
        available_params = sum([
            sensor_data.pressure is not None,
            sensor_data.temperature is not None,
            sensor_data.wall_thickness is not None,
            sensor_data.corrosion_rate is not None,
            sensor_data.vibration is not None,
            sensor_data.flow_rate is not None,
        ])

        # Base confidence on data completeness
        base_confidence = (available_params / total_params) * 100

        # Reduce confidence if critical parameters missing
        if sensor_data.wall_thickness is None or sensor_data.corrosion_rate is None:
            base_confidence *= 0.8  # 20% penalty for missing critical params

        # Add small random variance (simulate model uncertainty)
        variance = random.uniform(-5, 5)
        final_confidence = max(30, min(95, base_confidence + variance))

        return Decimal(f'{final_confidence:.2f}')

    def generate_recommendation(self, pof: Decimal, cof: str) -> Tuple[str, str]:
        """
        Generate recommended action and priority.

        Args:
            pof: Probability of failure
            cof: Consequence of failure

        Returns:
            Tuple of (recommended_action, priority)
        """
        pof_val = float(pof)

        # Determine priority based on risk matrix (PoF x CoF)
        if cof == 'critical' or pof_val >= 80:
            priority = 'critical'
            action = "IMMEDIATE ACTION REQUIRED: Schedule emergency inspection and shutdown if necessary. Inspect asset integrity immediately."
        elif cof == 'high' or pof_val >= 60:
            priority = 'high'
            action = "Schedule urgent inspection within 24-48 hours. Monitor parameters continuously. Prepare maintenance plan."
        elif cof == 'medium' or pof_val >= 40:
            priority = 'medium'
            action = "Plan inspection within 1-2 weeks. Increase monitoring frequency. Review maintenance schedule."
        else:
            priority = 'low'
            action = "Continue routine monitoring. Schedule inspection as per normal maintenance plan. No immediate action required."

        return action, priority

    def predict(
        self,
        db: Session,
        inspection_id: int,
        sensor_data: SensorDataCreate,
        user_id: int
    ) -> Tuple[SensorData, FailurePrediction]:
        """
        Main prediction method - processes sensor data and generates predictions.

        Args:
            db: Database session
            inspection_id: ID of the inspection
            sensor_data: Sensor readings
            user_id: ID of the user recording data

        Returns:
            Tuple of (SensorData, FailurePrediction) objects
        """
        logger.info(f"Generating AI prediction for inspection {inspection_id}")

        # 1. Save sensor data
        sensor_db = SensorData(
            inspection_id=inspection_id,
            pressure=sensor_data.pressure,
            temperature=sensor_data.temperature,
            wall_thickness=sensor_data.wall_thickness,
            corrosion_rate=sensor_data.corrosion_rate,
            vibration=sensor_data.vibration,
            flow_rate=sensor_data.flow_rate,
            notes=sensor_data.notes,
            recorded_by_id=user_id
        )
        db.add(sensor_db)
        db.flush()  # Get ID without committing

        # 2. Calculate predictions
        pof = self.calculate_pof(sensor_data)
        cof = self.calculate_cof(sensor_data, pof)
        confidence = self.calculate_confidence(sensor_data)
        recommended_action, priority = self.generate_recommendation(pof, cof)

        # 3. Calculate risk score (PoF * CoF weight)
        cof_weights = {'low': 1, 'medium': 2, 'high': 3, 'critical': 4}
        risk_score = float(pof) * cof_weights[cof]

        # 4. Save prediction
        prediction_db = FailurePrediction(
            sensor_data_id=sensor_db.id,
            inspection_id=inspection_id,
            probability_of_failure=pof,
            consequence_of_failure=ConsequenceLevel[cof],
            confidence_score=confidence,
            risk_score=Decimal(f'{risk_score:.2f}'),
            recommended_action=recommended_action,
            priority=PriorityLevel[priority],
            model_version="mock_v1.0"
        )
        db.add(prediction_db)
        db.commit()

        db.refresh(sensor_db)
        db.refresh(prediction_db)

        logger.info(
            f"Prediction generated: PoF={pof}%, CoF={cof}, "
            f"Confidence={confidence}%, Priority={priority}"
        )

        return sensor_db, prediction_db


# Service functions
def generate_ai_assessment(
    db: Session,
    inspection_id: int,
    sensor_data: SensorDataCreate,
    user_id: int
) -> Tuple[SensorData, FailurePrediction]:
    """
    Generate AI assessment for sensor data.

    Args:
        db: Database session
        inspection_id: ID of the inspection
        sensor_data: Sensor readings
        user_id: ID of the user recording data

    Returns:
        Tuple of (SensorData, FailurePrediction) objects

    Raises:
        HTTPException: If inspection not found
    """
    # Verify inspection exists
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection {inspection_id} not found"
        )

    # Generate prediction
    engine = MockAIPredictionEngine()
    return engine.predict(db, inspection_id, sensor_data, user_id)


def get_latest_assessment(db: Session, inspection_id: int) -> Optional[Tuple[SensorData, FailurePrediction]]:
    """
    Get latest AI assessment for an inspection.

    Args:
        db: Database session
        inspection_id: ID of the inspection

    Returns:
        Tuple of (SensorData, FailurePrediction) or None if not found
    """
    sensor_data = db.query(SensorData).filter(
        SensorData.inspection_id == inspection_id
    ).order_by(SensorData.recorded_at.desc()).first()

    if sensor_data and sensor_data.prediction:
        return sensor_data, sensor_data.prediction

    return None
