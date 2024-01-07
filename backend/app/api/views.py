from typing import Any, TypedDict
from django.contrib.auth.decorators import login_required
from django.http import Http404, HttpRequest, JsonResponse
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from rest_framework.response import Response
import jsonschema
from app.models import Activity, Item, ItemType, User
from app.serializers import (
    ActivityDetailSerializer,
    ActivityListSerializer,
    ItemDetailSerializer,
    ItemListSerializer,
    ItemTypeListSerializer,
    ItemTypeSerializer,
    UserSettingsSerializer,
)


class ItemTypeList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ItemTypeListSerializer

    def get_queryset(self):
        return ItemType.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        incoming = request.data
        new_item_type = ItemType(
            user=request.user, name=incoming["name"], slug=slugify(incoming["name"])
        )
        new_item_type.save()
        return Response(
            self.serializer_class(new_item_type).data, status=status.HTTP_201_CREATED
        )


class ItemTypeDetails(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ItemTypeSerializer
    lookup_field = "slug"

    def get_queryset(self):
        slug = self.kwargs["slug"]
        return ItemType.objects.filter(slug=slug, user=self.request.user)

    # TODO: validate in update that any changes to schema are valid?


class ItemDetailsType(TypedDict):
    info: dict[str, Any]


def get_or_create_validated_item(
    item_details: ItemDetailsType, item_type: ItemType, user: User
):
    item_required_fields = item_type.item_schema["required"]
    try:
        jsonschema.validate(item_details["info"], item_type.item_schema)
    except jsonschema.exceptions.ValidationError as e:
        return Response(e.message, status=status.HTTP_400_BAD_REQUEST)

    item, created = Item.objects.get_or_create(
        **{
            f"info__{k}": v
            for k, v in item_details["info"].items()
            if k in item_required_fields
        },
        defaults={**item_details, "item_type": item_type, "user": user},
    )
    return item, created


class ActivityDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ActivityDetailSerializer
    lookup_field = "token"

    def get_queryset(self):
        token = self.kwargs["token"]
        return Activity.objects.filter(user=self.request.user, token=token)


class ActivityList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ActivityListSerializer

    def get_queryset(self):
        return Activity.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        incoming = request.data

        item_details = incoming.pop("itemDetails")
        item_parent_token = item_details.pop("parent_token", None)

        item_type_slug = item_details.pop("item_type")
        item_type = get_object_or_404(ItemType, slug=item_type_slug, user=request.user)

        item, created = get_or_create_validated_item(
            item_details, item_type, request.user
        )
        if item_parent_token:
            parent = Item.objects.get(user=request.user, token=item_parent_token)
            item.parent = parent
            item.save()

        activity_details = incoming.pop("activityDetails")
        rating = activity_details.pop("rating", None)
        max_rating = request.user.settings.get("ratingMax", 5)
        if rating is not None:
            rating = rating / max_rating
        activity_details["rating"] = rating
        new_activity = Activity(
            user=request.user,
            item=item,
            **activity_details,
        )
        new_activity.save()
        serialized_obj = self.serializer_class(new_activity).data
        return Response(serialized_obj, status=status.HTTP_201_CREATED)


class ItemList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ItemListSerializer

    def get_queryset(self):
        return Item.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        incoming = {**request.data}

        item_type_slug = incoming.pop("item_type")
        set_as_parent_to = incoming.pop("setAsParentTo", None)
        item_details = {**incoming}

        item_type = get_object_or_404(ItemType, slug=item_type_slug, user=request.user)

        item, actually_created = get_or_create_validated_item(
            item_details, item_type, request.user
        )

        if set_as_parent_to:
            child_item = Item.objects.get(user=request.user, token=set_as_parent_to)
            child_item.parent = item
            child_item.save()

        serialized_item = self.serializer_class(item).data
        return Response(
            serialized_item,
            status=status.HTTP_201_CREATED if actually_created else status.HTTP_200_OK,
        )


class ItemDetails(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ItemDetailSerializer
    lookup_field = "token"

    def get_queryset(self):
        return Item.objects.filter(user=self.request.user, token=self.kwargs["token"])

    def partial_update(self, request, *args, **kwargs) -> Response:
        incoming = request.data
        parent_token = incoming.pop("parent_token", None)
        item_details = {**incoming}

        orig_obj = self.get_object()

        item_required_fields = orig_obj.item_type.item_schema["required"]

        try:
            jsonschema.validate(item_details["info"], orig_obj.item_type.item_schema)
        except jsonschema.exceptions.ValidationError as e:
            return Response(e.message, status=status.HTTP_400_BAD_REQUEST)

        res = super().partial_update(request, *args, **kwargs)
        if parent_token is not None:
            obj = self.get_object()
            if parent_token is False:
                obj.parent = None
            else:
                parent = Item.objects.get(user=request.user, token=parent_token)
                obj.parent = parent
            obj.save()
            res = Response(self.serializer_class(obj).data)
        return res


class UserDetails(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSettingsSerializer

    def get_queryset(self):
        return User.objects.filter(pk=self.request.user.pk)


@login_required
def get_item_autocomplete_values(request: HttpRequest, item_slug: str) -> JsonResponse:
    item_type = get_object_or_404(ItemType, user=request.user, slug=item_slug)
    auto_complete_choices = {}
    for field_name in item_type.item_schema["properties"].keys():
        vals = (
            Item.objects.filter(user=request.user, item_type__slug=item_slug)
            .values_list(f"info__{field_name}", flat=True)
            .distinct()
        )
        auto_complete_choices[field_name] = [
            {"label": v, "valuel": v} for v in vals if v is not None
        ]
    if item_type.parent_slug:
        items_of_parent_type = Item.objects.filter(
            user=request.user, item_type__slug=item_type.parent_slug
        )
        auto_complete_choices[item_type.parent_slug] = [
            {"label": i.name, "value": i.token} for i in items_of_parent_type
        ]

    return JsonResponse(auto_complete_choices)
