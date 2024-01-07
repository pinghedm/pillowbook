import datetime
import re
from django.core.validators import MaxValueValidator, MinValueValidator

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db.models.fields import EmailField, DateTimeField, TextField, BooleanField
from django.db.models.fields.json import JSONField
from django.contrib.postgres.fields import ArrayField


from app.utils.common_utils import TOKEN_REGEX, gen_token
from app.managers import UserManager


class TimeStampedModel(models.Model):
    class Meta:
        abstract = True
        get_latest_by = "created"

    created: "DateTimeField[datetime.datetime, datetime.datetime]" = DateTimeField(
        auto_now_add=True
    )
    modified: "DateTimeField[datetime.datetime, datetime.datetime]" = DateTimeField(
        auto_now=True
    )


def _gen_user_token():
    return f"U_{gen_token()}"


def _default_user_settings():
    return {
        "ratingMax": 5,
        "itemTypesInQuickMenu": ["book", "movie"],
    }


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = []

    email: "EmailField[str, str]" = EmailField(
        unique=True, db_collation="case_insensitive"
    )
    token: "TextField[str, str]" = TextField(default=_gen_user_token, unique=True)
    is_staff: "BooleanField[bool, bool]" = BooleanField(default=False)
    settings = JSONField(default=_default_user_settings, blank=True)

    objects = UserManager()

    @staticmethod
    def gen_token():
        return _gen_user_token()


class ItemType(TimeStampedModel):
    slug = models.SlugField(max_length=200, unique=True)
    name = models.TextField()
    item_schema = JSONField(default=dict, blank=True)
    activity_schema = JSONField(default=dict, blank=True)
    #  TODO: custom icon?
    name_schema = TextField(blank=True)
    user: "models.ForeignKey[User, User]" = models.ForeignKey(
        User, on_delete=models.CASCADE
    )
    auto_complete_config = JSONField(
        default=dict, blank=True
    )  # this will be config, per field for autocompleting against external providers - eg checking goodreads for book titles
    parent_slug = models.SlugField(max_length=200, null=True, blank=True)

    def __str__(self) -> str:
        return self.slug

    @staticmethod
    def update_defaults():
        from app.schemas import default_item_types

        for user in User.objects.all():
            for item_type in default_item_types:
                ItemType.objects.update_or_create(
                    slug=item_type["slug"], user=user, defaults=item_type
                )


def _gen_item_token():
    return f"I_{gen_token()}"


class Item(TimeStampedModel):
    name_template_regex = re.compile(r"{{(\w+)}}")

    token: "TextField[str, str]" = TextField(default=_gen_item_token, unique=True)
    info = JSONField(default=dict, blank=True)
    rating: "models.FloatField[float, float]" = models.FloatField(
        null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(1)]
    )
    notes: "TextField[str, str]" = TextField(blank=True)
    item_type = models.ForeignKey(ItemType, on_delete=models.CASCADE)
    user: "models.ForeignKey[User, User]" = models.ForeignKey(
        User, on_delete=models.CASCADE
    )
    parent = models.ForeignKey("Item", on_delete=models.SET_NULL, blank=True, null=True)

    @property
    def parent_name(self):
        if not self.parent:
            return ""
        return self.parent.name

    @property
    def name(self):
        name_fields = re.findall(self.name_template_regex, self.item_type.name_schema)
        name = self.item_type.name_schema
        for field in name_fields:
            name = name.replace("{{" + field + "}}", self.info.get(field, ""))
        return name

    def __str__(self) -> str:
        return f"Item<{self.token}> of type {self.item_type}"


def _gen_activity_token():
    return f"A_{gen_token()}"


class Activity(TimeStampedModel):
    class Meta:
        verbose_name_plural = "Activities"

    token: "TextField[str, str]" = TextField(default=_gen_activity_token, unique=True)

    user: "models.ForeignKey[User, User]" = models.ForeignKey(
        User, on_delete=models.CASCADE
    )
    item: "models.ForeignKey[Item, Item]" = models.ForeignKey(
        Item, on_delete=models.CASCADE
    )

    start_time: "DateTimeField[datetime.datetime, datetime.datetime]" = DateTimeField(
        null=True, blank=True
    )
    end_time: "DateTimeField[datetime.datetime, datetime.datetime]" = DateTimeField(
        null=True, blank=True
    )
    finished: "BooleanField[bool, bool]" = BooleanField(default=False)

    rating = models.FloatField(
        null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(1)]
    )
    notes = TextField(blank=True)

    info = JSONField(default=dict, blank=True)

    def __str__(self):
        return f"Activity <{self.token}> for {self.item.name}"
