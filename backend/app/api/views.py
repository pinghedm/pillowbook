from django.http import Http404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.response import Response

from app.models import Activity, Item, ItemType, User
from app.serializers import (
    ActivityDetailSerializer,
    ActivityListSerializer,
    ItemListSerializer,
    ItemTypeListSerializer,
    ItemTypeSerializer,
    UserSettingsSerializer,
)


class ItemTypeList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ItemTypeListSerializer

    def get_queryset(self):
        return ItemType.objects.all()

    def create(self, request, *args, **kwargs):
        raise NotImplemented


class ItemTypeDetails(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ItemTypeSerializer
    lookup_field = "slug"

    def get_queryset(self):
        slug = self.kwargs["slug"]
        return ItemType.objects.filter(slug=slug)


class ActivityList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ActivityListSerializer

    def get_queryset(self):
        return Activity.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        incoming = request.data

        item_details = incoming.pop("itemDetails")

        item_type_slug = item_details.pop("item_type")
        item_type = get_object_or_404(ItemType, slug=item_type_slug)
        item_required_fields = item_type.item_schema["required"]

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


class UserDetails(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSettingsSerializer

    def get_queryset(self):
        return User.objects.filter(pk=self.request.user.pk)
