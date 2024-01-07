from django.apps import AppConfig
import traceback


class AppConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "app"

    def ready(self):
        try:
            from app.models import ItemType

            ItemType.update_defaults()
        except:
            traceback.print_exc()
            ## this will get upset if there is a migration pending - thats fine
            pass
