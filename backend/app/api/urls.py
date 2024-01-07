from django.http import HttpResponse
from django.urls import path, re_path
from app.api.views import (
    update_item_type_icon,
    ActivityDetail,
    ActivityList,
    ItemDetails,
    ItemList,
    ItemTypeDetails,
    ItemTypeList,
    UserDetails,
    get_item_autocomplete_values,
)
from app.utils.common_utils import TOKEN_REGEX
from django.views.decorators.csrf import csrf_exempt


urlpatterns = [
    re_path("^item_type/(?P<slug>[\\w_-]+)/icon", update_item_type_icon),
    re_path("^item_type/(?P<slug>[\\w_-]+)", ItemTypeDetails.as_view()),
    path("item_type", ItemTypeList.as_view()),
    path("activity", ActivityList.as_view()),
    re_path(f"^activity/(?P<token>A_{TOKEN_REGEX})", ActivityDetail.as_view()),
    path("item", ItemList.as_view()),
    re_path(f"^item/(?P<token>I_{TOKEN_REGEX})", ItemDetails.as_view()),
    re_path("^settings/(?P<pk>\d+)", UserDetails.as_view()),
    re_path(
        f"^get_autocomplete_suggestions/(?P<item_slug>[\\w_-]+)",
        get_item_autocomplete_values,
    ),
]
