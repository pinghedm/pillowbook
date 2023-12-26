from django.contrib import admin

from app.models import Activity, Item, ItemType, User


class UserAdmin(admin.ModelAdmin):
    list_display = ["email"]
    search_fields = ["email"]


admin.site.register(User, UserAdmin)


class ItemTypeAdmin(admin.ModelAdmin):
    list_display = ["slug", "name"]
    search_fields = ["slug", "name"]


admin.site.register(ItemType, ItemTypeAdmin)


class ItemAdmin(admin.ModelAdmin):
    list_display = ["token", "user", "item_type", "rating"]
    search_fields = ["token"]
    list_filter = ["item_type", "user"]


admin.site.register(Item, ItemAdmin)


class ActivityAdmin(admin.ModelAdmin):
    list_display = ["token", "item", "user"]
    search_fields = ["token"]
    list_filter = ["item__item_type", "item", "user"]


admin.site.register(Activity, ActivityAdmin)
