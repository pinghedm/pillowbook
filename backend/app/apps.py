from django.apps import AppConfig


class AppConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "app"

    def ready(self):
        from app.models import ItemType
        from app.schemas import default_item_types

        for item_type in default_item_types:
            ItemType.objects.update_or_create(
                slug=item_type["slug"], defaults=item_type
            )
