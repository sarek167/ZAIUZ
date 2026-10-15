from django.db import models
from django.core.validators import MinLengthValidator

class Series(models.Model):
    name = models.CharField(max_length=100, verbose_name="Series' name")
    min_value = models.FloatField(verbose_name="Minimum value")
    max_value = models.FloatField(verbose_name="Maximum value")
    color = models.CharField(max_length=7, verbose_name="Color (HEX)")

    def __str__(self):
        return f"{self.name}"

class Sensor(models.Model):
    name = models.CharField(max_length=100, verbose_name="Sensor's name")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creation date")
    api_key_hash = models.CharField(max_length=255, verbose_name="API Key Hash")

    series = models.ForeignKey(Series, on_delete=models.CASCADE, related_name='sensors', verbose_name="Series")

    def __str__(self):
        return self.name

class Measurement(models.Model):
    timestamp = models.DateTimeField(verbose_name="Measurement Time")
    value = models.FloatField(verbose_name="Weight")
    
    series = models.ForeignKey(Series, on_delete=models.CASCADE, related_name='measurements', verbose_name="Series")
    sensor = models.ForeignKey(Sensor, on_delete=models.SET_NULL, null=True, blank=True, related_name='measurements', verbose_name="Sensor")

    def __str__(self):
        return f"{self.value}kg at {self.series.name} ({self.timestamp}))"