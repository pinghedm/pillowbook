from typing import Any, TypedDict

from rest_framework import generics, status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from rest_framework.request import Request
from rest_framework.response import Response
import jsonschema
from rest_framework.views import APIView
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
from rest_framework.pagination import PageNumberPagination

from django_filters.rest_framework import (
    BaseInFilter,
    CharFilter,
    DjangoFilterBackend,
    FilterSet,
)


class PaginationBase(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"

    def paginate_queryset(self, queryset, request, view=None):
        # this would normally return a list, but we want a queryset
        page = super().paginate_queryset(
            queryset.values_list("pk", flat=True), request, view
        )
        return queryset.filter(pk__in=page)


class CharInFilter(BaseInFilter, CharFilter):
    pass


class ItemTypeList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ItemTypeListSerializer

    def get_queryset(self):
        return ItemType.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        name = request.POST.get("name")
        if not name:
            return Response("", status=status.HTTP_400_BAD_REQUEST)
        parent_slug = request.POST.get("parent_slug", None)
        icon = request.FILES.get("icon")

        new_item_type = ItemType(
            user=request.user,
            name=name,
            slug=slugify(name),
            icon=icon if icon else None,
        )
        if parent_slug:
            try:
                parent_type = ItemType.objects.get(user=request.user, slug=parent_slug)
                new_item_type.parent_slug = parent_slug
            except ItemType.DoesNotExist:
                pass
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

    def partial_update(self, request, *args, **kwargs):
        parent_slug = request.data.pop("parent_slug", None)
        res = super().partial_update(request, *args, **kwargs)
        if parent_slug is not None:
            obj = self.get_object()
            if parent_slug is False:
                obj.parent_slug = None
            else:
                obj.parent_slug = parent_slug
            obj.save()
            res = Response(self.serializer_class(obj).data)
        return res

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


class ActivityFilterSet(FilterSet):
    itemTypes = CharInFilter(field_name="item__item_type__slug", lookup_expr="in")
    items = CharInFilter(field_name="item__token", lookup_expr="in")
    completed = CharInFilter(method="filter_by_completed")

    def filter_by_completed(self, queryset, name, value):
        # tragically cascader cant use bool, so we're going to get back the strings 'false' and 'true'
        if "false" in value:
            queryset = queryset.filter(finished=False)
        if "true" in value:
            queryset = queryset.filter(finished=True)
        return queryset

        # i think this is ok, cause i think the FE will never send back _both_

    class Meta:
        model = Activity
        fields = []


class ActivitySearchFilter(SearchFilter):
    def get_search_fields(self, view: APIView, request: Request):
        schemas = ItemType.objects.filter(user=request.user).values_list(
            "item_schema", flat=True
        )
        fields = set()
        for s in schemas:
            fields |= set(s.get("required", []))

        return [f"item__info__{f}" for f in fields if f]


class ActivityList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ActivityListSerializer
    pagination_class = PaginationBase
    filter_backends = [DjangoFilterBackend, OrderingFilter, ActivitySearchFilter]
    filterset_class = ActivityFilterSet

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


class ItemFilterSet(FilterSet):
    itemTypes = CharInFilter(field_name="item_type__slug", lookup_expr="in")

    class Meta:
        model = Item
        fields = []


class ItemSearchFilter(SearchFilter):
    def get_search_fields(self, view: APIView, request: Request):
        schemas = ItemType.objects.filter(user=request.user).values_list(
            "item_schema", flat=True
        )
        fields = set()
        for s in schemas:
            fields |= set(s.get("required", []))

        return [f"info__{f}" for f in fields if f]


class ItemList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ItemListSerializer
    pagination_class = PaginationBase
    filter_backends = [DjangoFilterBackend, ItemSearchFilter, OrderingFilter]
    filterset_class = ItemFilterSet
    ordering_fields = ["rating", "item_type__slug", "parent__token"]

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
