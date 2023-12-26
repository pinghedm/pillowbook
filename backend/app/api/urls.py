from django.urls import path, re_path
from app.api.views import ActivityList, ItemTypeDetails, ItemTypeList


urlpatterns = [
    re_path("^item_type/(?P<slug>[\\w_-]+)", ItemTypeDetails.as_view()),
    path("item_type", ItemTypeList.as_view()),
    path("activity", ActivityList.as_view()),
]
