from os import read
from django.db.models.base import Model
from rest_framework.fields import CharField
from rest_framework.relations import SlugRelatedField
from rest_framework.serializers import ModelSerializer

from app.models import Activity, Item, ItemType, User


class ItemTypeListSerializer(ModelSerializer):
    icon_url = CharField(read_only=True)

    class Meta:
        model = ItemType
        fields = ["slug", "name", "parent_slug", "icon_url"]


class ItemTypeSerializer(ModelSerializer):
    icon_url = CharField(read_only=True)

    class Meta:
        model = ItemType
        fields = [
            "slug",
            "name",
            "item_schema",
            "activity_schema",
            "name_schema",
            "parent_slug",
            "icon_url",
        ]


class ActivityListSerializer(ModelSerializer):
    item_type_icon_url = CharField(source="item.item_type.icon_url", read_only=True)
    item_icon_url = CharField(source="item.icon_url", read_only=True)
    item_type = CharField(source="item.item_type.slug")
    item_type_name = CharField(source="item.item_type.name")
    item_name = CharField(source="item.name")

    class Meta:
        model = Activity
        fields = [
            "token",
            "item_type",
            "item_type_name",
            "start_time",
            "end_time",
            "finished",
            "rating",
            "item_name",
            "item_type_icon_url",
            "item_icon_url",
            "pending",
        ]


class ActivityDetailSerializer(ModelSerializer):
    icon_url = CharField(source="item.item_type.icon_url", read_only=True)
    item = SlugRelatedField(slug_field="token", queryset=Item.objects.all())
    item_type = CharField(source="item.item_type.slug")
    token = CharField(read_only=True)

    class Meta:
        model = Activity
        fields = [
            "token",
            "item_type",
            "item",
            "start_time",
            "end_time",
            "finished",
            "rating",
            "notes",
            "info",
            "icon_url",
            "pending",
        ]


class ItemListSerializer(ModelSerializer):
    item_type = CharField(source="item_type.slug")
    item_type_name = CharField(source="item_type.name")
    item_type_icon_url = CharField(read_only=True, source="item_type.icon_url")
    icon_url = CharField(read_only=True)

    class Meta:
        model = Item
        fields = [
            "token",
            "name",
            "rating",
            "item_type",
            "item_type_name",
            "parent_name",
            "icon_url",
            "item_type_icon_url",
            "pinned",
        ]


class ItemDetailSerializer(ModelSerializer):
    item_type = CharField(source="item_type.slug")
    token = CharField(read_only=True)
    parent_token = CharField(source="parent.token", allow_null=True)
    item_type_icon_url = CharField(read_only=True, source="item_type.icon_url")
    icon_url = CharField(read_only=True)

    class Meta:
        model = Item
        fields = [
            "token",
            "rating",
            "notes",
            "item_type",
            "info",
            "name",
            "parent_name",
            "parent_token",
            "item_type_icon_url",
            "icon_url",
            "pinned",
        ]


class UserSettingsSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ["settings"]
