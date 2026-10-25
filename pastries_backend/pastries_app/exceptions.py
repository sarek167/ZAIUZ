from rest_framework.exceptions import APIException

class WrongCredentials(APIException):
    status_code = 401
    default_detail = "The provided credentials are incorrect."
    default_code = "unauthorized"

class SeriesRangeConflict(APIException):
    status_code = 409
    default_detail = "The series range cannot exclude existing measurements."
    default_code = "conflict"

class SeriesRangeInvalid(APIException):
    status_code = 422
    default_detail = "The series range is invalid."
    default_code = "unprocessable_content"

class SeriesNotFound(APIException):
    status_code = 404
    default_detail = "The specified series was not found."
    default_code = "not_found"

class MeasurementValueOutOfRange(APIException):
    status_code = 422
    default_detail = "The measurement value is out of the allowed range for the series."
    default_code = "unprocessable_content"

class MeasurementTimestampError(APIException):
    status_code = 422
    default_detail = "The measurement timestamp is invalid."
    default_code = "unprocessable_content"

class InvalidDateTimeFormat(APIException):
    status_code = 400
    default_detail = "The provided date-time format is invalid."
    default_code = "bad_request"