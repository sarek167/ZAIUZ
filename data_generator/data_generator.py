import random
from datetime import datetime, timedelta, timezone
import time 

class DataGenerator:
    def __init__(self, api_address, sensor_key, mode="random", measurements_num=None, start_time=None, interval=None, range_start=0.0, range_end=100.0):
        if measurements_num is None and interval is None:
            raise ValueError("Either measurements_num or interval must be provided.")
        if start_time is None:
            self.life_measurements = True
            start_time = datetime.now(timezone.utc)
        else:
            self.life_measurements = False
            if start_time.tzinfo is None:
                start_time = start_time.astimezone()
            start_time = start_time.astimezone(timezone.utc)
            if start_time > datetime.now(timezone.utc) + timedelta(minutes=1):
                raise ValueError("start_time cannot be in the future.")
        if interval is None:
            interval = random.uniform(10, 100) 
        self.api_address = api_address
        self.sensor_key = sensor_key
        self.mode = mode
        self.measurements_num = measurements_num
        self.start_time = start_time
        self.interval = interval
        self.range_start = range_start
        self.range_end = range_end

    def generate_measurements(self):
        if self.mode == "random":
            return self._generate_random_measurements()
        elif self.mode == "sine":
            return self._generate_sine_measurements()
        else:
            raise ValueError("Invalid mode. Choose 'random' or 'sine'.")

    def _generate_random_measurements(self):
        import random
        measurements = []
        current_time = self.start_time
        for _ in range(self.measurements_num):
            value = random.random() * (self.range_end - self.range_start) + self.range_start
            status_code, response_text = self._send_single_measurement({"timestamp": current_time.isoformat(), "value": value})
            if status_code != 201:
                print(f"Failed to send measurement: {response_text}")
            measurements.append({"timestamp": current_time.isoformat(), "value": value})
            if self.life_measurements:
                time.sleep(self.interval)
                current_time = datetime.now(timezone.utc)
            else:
                current_time += timedelta(seconds=self.interval)
        return measurements

    def _generate_sine_measurements(self):
        import math
        measurements = []
        current_time = self.start_time
        for i in range(self.measurements_num):
            value = (math.sin(i * 2 * math.pi / self.measurements_num) + 1) / 2 * (self.range_end - self.range_start) + self.range_start
            status_code, response_text = self._send_single_measurement({"timestamp": current_time.isoformat(), "value": value})
            if status_code != 201:
                print(f"Failed to send measurement: {response_text}")
            measurements.append({"timestamp": current_time.isoformat(), "value": value})
            if self.life_measurements:
                time.sleep(self.interval)
                current_time = datetime.now(timezone.utc)
            else:
                current_time += timedelta(seconds=self.interval)
        return measurements

    def _send_single_measurement(self, measurement):
        import requests
        headers = {
            'Content-Type': 'application/json',
            "X-API-KEY": self.sensor_key
            }
        response = requests.post(self.api_address, json={"timestamp": measurement.get("timestamp"), "value": measurement.get("value")}, headers=headers)
        return response.status_code, response.text

if __name__ == "__main__":
    def main():
        import argparse
        parser = argparse.ArgumentParser(description="Generate and send measurements to an API.")
        parser.add_argument("--api_address", required=True, help="The API address to send measurements to.")
        parser.add_argument("--sensor_key", required=True, help="The sensor key for authentication.")
        parser.add_argument("--mode", choices=["random", "sine"], default="random", help="The mode of measurement generation.")
        parser.add_argument("--measurements_num", type=int, help="The number of measurements to generate.")
        parser.add_argument("--start_time", type=lambda s: datetime.fromisoformat(s.replace("Z", "+00:00")), help="The start time for measurements (ISO format).")
        parser.add_argument("--interval", type=float, help="The interval between measurements in seconds.")
        parser.add_argument("--range_start", type=float, default=0.0, help="The start of the value range.")
        parser.add_argument("--range_end", type=float, default=100.0, help="The end of the value range.")

        args = parser.parse_args()

        generator = DataGenerator(
            api_address=args.api_address,
            sensor_key=args.sensor_key,
            mode=args.mode,
            measurements_num=args.measurements_num,
            start_time=args.start_time,
            interval=args.interval,
            range_start=args.range_start,
            range_end=args.range_end
        )

        generator.generate_measurements()
main()

