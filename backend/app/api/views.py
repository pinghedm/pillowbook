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

        item_type_slug = item_details.pop("item_type")
        item_type = get_object_or_404(ItemType, slug=item_type_slug, user=request.user)
        item_required_fields = item_type.item_schema["required"]
        try:
            jsonschema.validate(item_details["info"], item_type.item_schema)
        except jsonschema.exceptions.ValidationError as e:
            return Response(e.message, status=status.HTTP_400_BAD_REQUEST)

        item, _ = Item.objects.get_or_create(
            **{
                f"info__{k}": v
                for k, v in item_details["info"].items()
                if k in item_required_fields
            },
            defaults={**item_details, "item_type": item_type, "user": request.user},
        )

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


class ItemList(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ItemListSerializer

    def get_queryset(self):
        return Item.objects.filter(user=self.request.user)


class ItemDetails(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ItemDetailSerializer
    lookup_field = "token"

    def get_queryset(self):
        return Item.objects.filter(user=self.request.user, token=self.kwargs["token"])

    # TODO: validate incoming updates against the schema


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
        auto_complete_choices[field_name] = [v for v in vals if v is not None]

    return JsonResponse(auto_complete_choices)
