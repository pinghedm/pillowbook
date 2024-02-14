from os import environ
import requests
from bs4 import BeautifulSoup

from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404

from app.models import Item, ItemType


@login_required
def get_item_autocomplete_values(request: HttpRequest, item_slug: str) -> JsonResponse:
    item_type = get_object_or_404(ItemType, user=request.user, slug=item_slug)
    auto_complete_choices = {}
    for field_name in item_type.item_schema.get("properties", {}).keys():
        vals = (
            Item.objects.filter(user=request.user, item_type__slug=item_slug)
            .values_list(f"info__{field_name}", flat=True)
            .distinct()
        )
        auto_complete_choices[field_name] = [
            {"label": v, "value": v} for v in vals if v is not None
        ]
    if item_type.parent_slug:
        items_of_parent_type = Item.objects.filter(
            user=request.user, item_type__slug=item_type.parent_slug
        )
        auto_complete_choices[item_type.parent_slug] = [
            {"label": i.name, "value": i.token} for i in items_of_parent_type
        ]

    return JsonResponse(auto_complete_choices)


@login_required
def update_item_type_icon(request, slug):
    icon = request.FILES.get("file")
    item_type = get_object_or_404(ItemType, user=request.user, slug=slug)
    if request.method in {"POST", "DELETE"}:
        try:
            icon = request.FILES["file"]
        except KeyError:
            # if we are deleting the logo, we send an empty body
            icon = None
        item_type.icon = icon
        item_type.save()

    return HttpResponse()


@login_required
def get_activities_static_filters(request: HttpRequest) -> JsonResponse:
    res = {}

    item_type_tuples = ItemType.objects.filter(user=request.user).values_list(
        "name", "slug"
    )
    res["itemTypes"] = [{"label": i[0], "value": i[1]} for i in item_type_tuples]

    items = Item.objects.filter(user=request.user).only("token", "info")
    res["items"] = [{"label": i.name, "value": i.token} for i in items]

    return JsonResponse(res)


@login_required
def get_items_static_filters(request: HttpRequest) -> JsonResponse:
    res = {}

    item_type_tuples = ItemType.objects.filter(user=request.user).values_list(
        "name", "slug"
    )
    res["itemTypes"] = [{"label": i[0], "value": i[1]} for i in item_type_tuples]

    return JsonResponse(res)


@login_required
def update_item_icon(request: HttpRequest, item_token: str) -> HttpResponse:
    if request.method == "DELETE":
        file = None
    else:
        file = request.FILES["file"]
    item = get_object_or_404(Item, user=request.user, token=item_token)
    item.icon = file
    item.save()
    return HttpResponse()


@login_required
def version(request: HttpRequest):
    return JsonResponse({"version": environ.get("COMMIT_HASH", "local")})


def _goodreads_query(searchQuery: str):
    r = requests.get(f"https://www.goodreads.com/search?q={searchQuery}")
    if not r.status_code == 200:
        return []

    soup = BeautifulSoup(r.text, "html.parser")
    print(soup)
    return []


PLUGIN_CONFIG_TEMP = {"goodreads": {"queryFunc": _goodreads_query}}


@login_required
def plugin_autocomplete(request: HttpRequest, item_type_slug: str) -> JsonResponse:
    query = request.GET.get("query")
    plugin = request.GET.get("plugin")

    func = PLUGIN_CONFIG_TEMP[plugin]["queryFunc"]
    res = func(query)
    return JsonResponse({"data": res})
