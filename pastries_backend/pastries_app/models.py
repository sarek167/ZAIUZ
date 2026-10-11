from django.db import models
from django.core.validators import MinLengthValidator

class City(models.Model):
    name = models.CharField(max_length=255, verbose_name="City's name")

    def __str__(self):
        return self.name

class Pastry(models.Model):
    name = models.CharField(max_length=255, verbose_name="Pastry's name")

    def __str__(self):
        return self.name

class Series(models.Model):
    name = models.CharField(max_length=255, verbose_name="Series' name")
    min_value = models.FloatField(verbose_name="Minimum value")
    max_value = models.FloatField(verbose_name="Maximum value")
    hex_color = models.CharField(max_length=7, verbose_name="Color (HEX)")
    
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='series', verbose_name="City")
    pastry = models.ForeignKey(Pastry, on_delete=models.CASCADE, related_name='series', verbose_name="Pastry")

    def __str__(self):
        return f"{self.name} ({self.city.name} - {self.pastry.name})"

class Sensor(models.Model):
    name = models.CharField(max_length=255, verbose_name="Sensor's name")
    api_key_hash = models.CharField(max_length=255, verbose_name="API Key Hash")

    series = models.ForeignKey(Series, on_delete=models.CASCADE, related_name='sensors', verbose_name="Series")

    def __str__(self):
        return self.name

class Measurement(models.Model):
    measurement_datetime = models.DateTimeField(verbose_name="Measurement Time")
    weight = models.FloatField(verbose_name="Weight")
    
    series = models.ForeignKey(Series, on_delete=models.CASCADE, related_name='measurements', verbose_name="Series")
    sensor = models.ForeignKey(Sensor, on_delete=models.SET_NULL, null=True, blank=True, related_name='measurements', verbose_name="Sensor")

    def __str__(self):
        return f"{self.weight}kg at {self.series.name} ({self.measurement_datetime})"