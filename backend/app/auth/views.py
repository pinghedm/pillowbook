from django.http.request import HttpRequest
from django.http.response import HttpResponse, JsonResponse
from app.models import User
from app.utils.common_utils import request_body_decode
from django.contrib.auth import authenticate, login as login_, logout as logout_
import logging
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)


@csrf_exempt
def login(request: HttpRequest):
    post_data = request_body_decode(request.body)
    email = post_data["email"]
    password = post_data["password"]

    user = authenticate(request, username=email, password=password)

    if user:
        logger.info(f"Successful login: {user}")
        login_(request, user)
        return HttpResponse()
    logger.info(f"Failed Login: {email}")
    return HttpResponse(status=403)


def user_is_logged_in(request: HttpRequest):
    user = request.user
    return JsonResponse({"authenticated": user.is_authenticated})


@login_required
def logout(request: HttpRequest):
    logger.info(f"Logging out {request.user}")
    logout_(request)
    return HttpResponse()
