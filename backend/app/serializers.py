from django.db.models.base import Model
from rest_framework.fields import CharField
from rest_framework.relations import SlugRelatedField
from rest_framework.serializers import ModelSerializer

from app.models import Activity, Item, ItemType, User


class ItemTypeListSerializer(ModelSerializer):
    class Meta:
        model = ItemType
        fields = ["slug", "name"]


class ItemTypeSerializer(ModelSerializer):
    class Meta:
        model = ItemType
        fields = ["slug", "name", "item_schema", "activity_schema"]


class ActivityListSerializer(ModelSerializer):
    item_type = CharField(source="item.item_type.slug")
    item_name = CharField(source="item.name")

    class Meta:
        model = Activity
        fields = [
            "token",
            "item_type",
            "start_time",
            "end_time",
            "finished",
            "rating",
            "item_name",
        ]


class ActivityDetailSerializer(ModelSerializer):
    item = SlugRelatedField(slug_field="token", queryset=Item.objects.all())
    item_type = CharField(source="item.item_type.slug")
    item_name = CharField(source="item.name")

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
        ]


class ItemListSerializer(ModelSerializer):
    item_type = CharField(source="item_type.slug")

    class Meta:
        model = Item
        fields = [
            "token",
            "name",
            "rating",
            "item_type",
        ]


class UserSettingsSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ["settings"]
