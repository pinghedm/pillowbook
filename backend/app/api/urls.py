from django.urls import path, re_path
from app.api.non_drf_views import (
    get_activities_static_filters,
    get_item_autocomplete_values,
    get_items_static_filters,
    update_item_icon,
    update_item_type_icon,
    version,
)
from app.api.views import (
    ActivityDetail,
    ActivityList,
    ItemDetails,
    ItemList,
    ItemTypeDetails,
    ItemTypeList,
    UserDetails,
)
from app.utils.common_utils import TOKEN_REGEX


urlpatterns = [
    re_path("^item_type/(?P<slug>[\\w_-]+)/icon", update_item_type_icon),
    re_path("^item_type/(?P<slug>[\\w_-]+)", ItemTypeDetails.as_view()),
    path("item_type", ItemTypeList.as_view()),
    path("activity", ActivityList.as_view()),
    re_path(f"^activity/(?P<token>A_{TOKEN_REGEX})", ActivityDetail.as_view()),
    path("item", ItemList.as_view()),
    re_path(f"^item/(?P<token>I_{TOKEN_REGEX})", ItemDetails.as_view()),
    re_path("^settings/(?P<pk>\\d+)", UserDetails.as_view()),
    re_path(
        f"^get_autocomplete_suggestions/(?P<item_slug>[\\w_-]+)",
        get_item_autocomplete_values,
    ),
    path("get_activities_static_filters", get_activities_static_filters),
    path("get_items_static_filters", get_items_static_filters),
    re_path(f"^item_icon/(?P<item_token>I_{TOKEN_REGEX})", update_item_icon),
    path("version", version),
]
