import json
from typing import Any
from django.utils.crypto import get_random_string
import string

TOKEN_REGEX = r"[\w_-]+"


def gen_token(length=12):
    return get_random_string(
        length=length,
        allowed_chars=string.ascii_letters + string.digits,
    )


def request_body_decode(request_body: bytes) -> dict[str, Any]:
    result = json.loads(request_body.decode("utf8"))
    return result
