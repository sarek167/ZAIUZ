from rest_framework.exceptions import APIException

class SeriesRangeConflict(APIException):
    status_code = 409
    default_detail = "The series range cannot exclude existing measurements."
    default_code = "conflict"