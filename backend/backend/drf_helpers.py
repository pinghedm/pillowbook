from django.middleware.csrf import CsrfViewMiddleware
from rest_framework.authentication import (
    SessionAuthentication as DrfSessionAuthentication,
)
from rest_framework.exceptions import NotAuthenticated


class CsrfException(Exception):
    pass


class CSRFCheck(CsrfViewMiddleware):
    def _reject(self, request, reason):
        # Return the failure reason instead of an HttpResponse
        return reason


class SessionAuthentication(DrfSessionAuthentication):
    def enforce_csrf(self, request):
        """
        Enforce CSRF validation for session based authentication.
        """

        def dummy_get_response(request):  # pragma: no cover
            return None

        check = CsrfViewMiddleware(dummy_get_response)
        # populates request.META['CSRF_COOKIE'], which is used in process_view()
        check.process_request(request)
        reason = check.process_view(request, None, (), {})
        if reason:
            # CSRF failed, bail with explicit error message
            raise CsrfException(reason)


class ExtensionSessionAuthentication(SessionAuthentication):
    def authenticate(self, request):
        super_user = super().authenticate(request)
        if super_user is not None:
            return super_user
        try:
            u = request.wt_info["ext"]["user"]
            if not u.is_active:
                return None
            return (u, None)
        except:
            return None

    def enforce_csrf(self, request):
        try:
            return super().enforce_csrf(request)
        except CsrfException:
            header = request.headers.get("X-ExtCSRF")
            cookie = request.COOKIES.get("extcsrf")
            if cookie and cookie == header:
                return
            raise


def exception_handler(exc, context):
    from rest_framework.views import exception_handler as drf_exception_handler

    # Call REST framework's default exception handler first,
    # to get the standard error response.
    if isinstance(exc, CsrfException):
        return exc.args[0]
    response = drf_exception_handler(exc, context)

    # Now add the HTTP status code to the response.
    if response is not None:
        response.data["status_code"] = response.status_code

    return response
