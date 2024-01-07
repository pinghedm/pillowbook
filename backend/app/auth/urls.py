from django.urls import include, path, re_path


from app.auth.views import login, logout, user_is_logged_in

urlpatterns = [
    path("login", login),
    path("logout", logout),
    path("user_is_logged_in", user_is_logged_in),
]
