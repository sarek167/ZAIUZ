from http import HTTPStatus
from rest_framework.views import exception_handler as drf_exception_handler

def problem_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is not None:
        response.data = {
            "type": "about:blank",
            "title": HTTPStatus(response.status_code).phrase,
            "status": response.status_code,
            "detail": str(response.data.get("detail", "")),
        }
        response.content_type = "application/problem+json"
    return response