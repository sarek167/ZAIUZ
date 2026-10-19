import django_filters
from .models import Measurement

class MeasurementFilter(django_filters.FilterSet):
    start_time = django_filters.DateTimeFilter(field_name="timestamp", lookup_expr="gte")
    end_time = django_filters.DateTimeFilter(field_name="timestamp", lookup_expr="lte")

    class Meta:
        model = Measurement
        fields = ["series", "start_time", "end_time"]