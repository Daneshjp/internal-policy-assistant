"""
Mock sensor data simulator.

Simulates realistic sensor readings with random variations
to mimic real-world sensor behavior.
"""
import random
from decimal import Decimal
from typing import Dict, Optional


class SensorSimulator:
    """
    Simulates sensor data with realistic variations.

    Generates sensor readings that vary around baseline values
    with occasional anomalies to trigger different risk levels.
    """

    # Baseline "normal" operating ranges
    BASELINE_RANGES = {
        'pressure': {'min': 8.0, 'max': 12.0, 'unit': 'bar'},
        'temperature': {'min': 70.0, 'max': 85.0, 'unit': '°C'},
        'wall_thickness': {'min': 9.0, 'max': 12.0, 'unit': 'mm'},
        'corrosion_rate': {'min': 0.05, 'max': 0.15, 'unit': 'mm/year'},
        'vibration': {'min': 1.5, 'max': 3.0, 'unit': 'mm/s'},
        'flow_rate': {'min': 40.0, 'max': 60.0, 'unit': 'm³/h'},
    }

    def __init__(self, risk_mode: str = 'normal'):
        """
        Initialize simulator.

        Args:
            risk_mode: 'normal', 'warning', 'critical', or 'random'
        """
        self.risk_mode = risk_mode

    def generate_reading(self, parameter: str) -> Optional[Decimal]:
        """
        Generate a single sensor reading.

        Args:
            parameter: Sensor parameter name

        Returns:
            Simulated sensor value
        """
        if parameter not in self.BASELINE_RANGES:
            return None

        baseline = self.BASELINE_RANGES[parameter]

        if self.risk_mode == 'normal':
            # Normal operation: values within baseline range with small variation
            value = random.uniform(baseline['min'], baseline['max'])
            variation = random.uniform(-0.05, 0.05) * value
            value += variation

        elif self.risk_mode == 'warning':
            # Warning condition: values approaching warning thresholds
            if parameter == 'pressure':
                value = random.uniform(14.0, 17.0)
            elif parameter == 'temperature':
                value = random.uniform(95.0, 105.0)
            elif parameter == 'wall_thickness':
                value = random.uniform(7.0, 8.5)
            elif parameter == 'corrosion_rate':
                value = random.uniform(0.25, 0.35)
            elif parameter == 'vibration':
                value = random.uniform(4.0, 5.5)
            elif parameter == 'flow_rate':
                value = random.uniform(75.0, 85.0)

        elif self.risk_mode == 'critical':
            # Critical condition: values at or above critical thresholds
            if parameter == 'pressure':
                value = random.uniform(20.0, 25.0)
            elif parameter == 'temperature':
                value = random.uniform(120.0, 135.0)
            elif parameter == 'wall_thickness':
                value = random.uniform(4.0, 5.5)
            elif parameter == 'corrosion_rate':
                value = random.uniform(0.5, 0.7)
            elif parameter == 'vibration':
                value = random.uniform(7.0, 9.0)
            elif parameter == 'flow_rate':
                value = random.uniform(100.0, 120.0)

        else:  # random mode
            # Mix of normal, warning, and critical
            mode = random.choices(['normal', 'warning', 'critical'], weights=[0.7, 0.2, 0.1])[0]
            self.risk_mode = mode
            value = self.generate_reading(parameter)
            self.risk_mode = 'random'
            return value

        # Add precision based on parameter
        if parameter == 'corrosion_rate':
            return Decimal(f'{value:.4f}')
        else:
            return Decimal(f'{value:.2f}')

    def generate_full_reading(self) -> Dict[str, Optional[Decimal]]:
        """
        Generate readings for all sensors.

        Returns:
            Dictionary of all sensor readings
        """
        return {
            'pressure': self.generate_reading('pressure'),
            'temperature': self.generate_reading('temperature'),
            'wall_thickness': self.generate_reading('wall_thickness'),
            'corrosion_rate': self.generate_reading('corrosion_rate'),
            'vibration': self.generate_reading('vibration'),
            'flow_rate': self.generate_reading('flow_rate'),
        }

    def generate_partial_reading(self, num_sensors: int = 4) -> Dict[str, Optional[Decimal]]:
        """
        Generate readings for a subset of sensors (simulating sensor availability).

        Args:
            num_sensors: Number of sensors to generate (1-6)

        Returns:
            Dictionary of sensor readings (some may be None)
        """
        all_sensors = list(self.BASELINE_RANGES.keys())
        selected_sensors = random.sample(all_sensors, min(num_sensors, len(all_sensors)))

        reading = {}
        for sensor in all_sensors:
            if sensor in selected_sensors:
                reading[sensor] = self.generate_reading(sensor)
            else:
                reading[sensor] = None

        return reading


def simulate_sensor_data_for_inspection(
    inspection_id: int,
    mode: str = 'random'
) -> Dict[str, Optional[Decimal]]:
    """
    Generate simulated sensor data for an inspection.

    This function simulates the behavior of real sensors that might
    be attached to the asset being inspected.

    Args:
        inspection_id: ID of the inspection
        mode: Risk mode ('normal', 'warning', 'critical', 'random')

    Returns:
        Dictionary of sensor readings
    """
    simulator = SensorSimulator(risk_mode=mode)

    # Randomly decide whether to return full or partial sensor data
    # (simulating real-world scenarios where some sensors may be offline)
    if random.random() < 0.8:  # 80% chance of full data
        return simulator.generate_full_reading()
    else:  # 20% chance of partial data
        num_sensors = random.randint(3, 5)
        return simulator.generate_partial_reading(num_sensors)
