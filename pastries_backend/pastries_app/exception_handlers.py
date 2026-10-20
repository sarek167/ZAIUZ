from http import HTTPStatus
from rest_framework.views import exception_handler as drf_exception_handler

def problem_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is not None and response.status_code == 404:
        detail = response.data.get("detail", "Not found.")
        response.data = {
            "type": "about:blank",
            "title": HTTPStatus.NOT_FOUND.phrase,
            "status": HTTPStatus.NOT_FOUND.value,
            "detail": str(detail),
        }
        response.content_type = "application/problem+json"
    return response