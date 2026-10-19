import django_filters
from rest_framework.filters import OrderingFilter
from .models import Measurement


class MeasurementOrderingFilter(OrderingFilter):
    ordering_param = "sort"

class NumberInFilter(django_filters.BaseInFilter, django_filters.NumberFilter):
    pass

class MeasurementFilter(django_filters.FilterSet):
    series = NumberInFilter(field_name="series__id", lookup_expr="in")
    class Meta:
        model = Measurement
        fields = ["series"]