from django.apps import AppConfig
import traceback
import os


class AppConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "app"

    def ready(self):
        try:
            from app.models import ItemType

            # ItemType.update_defaults()
        except:
            if not os.environ.get("CI"):
                traceback.print_exc()
            ## this will get upset if there is a migration pending - thats fine
            pass
