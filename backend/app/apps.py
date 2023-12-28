from django.apps import AppConfig


class AppConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "app"

    def ready(self):
        try:
            from app.models import ItemType

            ItemType.update_defaults()
        except:
            ## this will get upset if there is a migration pending - thats fine
            pass
