from rest_framework.fields import CharField
from rest_framework.relations import SlugRelatedField
from rest_framework.serializers import ModelSerializer

from app.models import Activity, Item, ItemType


class ItemTypeListSerializer(ModelSerializer):
    class Meta:
        model = ItemType
        fields = ["slug", "name"]


class ItemTypeSerializer(ModelSerializer):
    class Meta:
        model = ItemType
        fields = ["slug", "name", "item_schema", "activity_schema"]


class ActivityDetailSerializer(ModelSerializer):
    item = SlugRelatedField(slug_field="token", queryset=Item.objects.all())
    item_type = CharField(source="item.item_type.slug")

    class Meta:
        model = Activity
        fields = [
            "item_type",
            "item",
            "token",
            "start_time",
            "end_time",
            "finished",
            "rating",
            "notes",
            "info",
        ]
