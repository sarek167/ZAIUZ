import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("pastries_app", "0003_alter_sensor_name"),
    ]

    operations = [
        migrations.AlterField(
            model_name="series",
            name="color",
            field=models.CharField(
                max_length=7,
                validators=[
                    django.core.validators.RegexValidator("^#[0-9A-Fa-f]{6}$"),
                ],
                verbose_name="Color (HEX)",
            ),
        ),
        migrations.AddConstraint(
            model_name="series",
            constraint=models.UniqueConstraint(
                fields=("name",),
                name="series_name_unique",
            ),
        ),
        migrations.AddConstraint(
            model_name="series",
            constraint=models.CheckConstraint(
                check=models.Q(min_value__lt=models.F("max_value")),
                name="series_min_value_lt_max",
            ),
        ),
        migrations.AddConstraint(
            model_name="series",
            constraint=models.CheckConstraint(
                check=models.Q(name__gt=""),
                name="series_name_not_empty",
            ),
        ),
        migrations.AddConstraint(
            model_name="sensor",
            constraint=models.UniqueConstraint(
                fields=("series", "name"),
                name="sensor_name_unique_per_series",
            ),
        ),
        migrations.AddConstraint(
            model_name="sensor",
            constraint=models.UniqueConstraint(
                fields=("api_key_hash",),
                name="sensor_api_key_hash_unique",
            ),
        ),
        migrations.AddConstraint(
            model_name="sensor",
            constraint=models.CheckConstraint(
                check=models.Q(name__gt=""),
                name="sensor_name_not_empty",
            ),
        ),
    ]
