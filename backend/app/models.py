import datetime
from django.core.validators import MaxValueValidator, MinValueValidator

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db.models.fields import EmailField, DateTimeField, TextField, BooleanField
from django.db.models.fields.json import JSONField

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


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = []

    email: "EmailField[str, str]" = EmailField(
        unique=True, db_collation="case_insensitive"
    )
    token: "TextField[str, str]" = TextField(default=_gen_user_token, unique=True)
    is_staff: "BooleanField[bool, bool]" = BooleanField(default=False)

    objects = UserManager()

    @staticmethod
    def gen_token():
        return _gen_user_token()


class ItemType(TimeStampedModel):
    slug = models.SlugField(max_length=200)
    name = models.TextField()
    item_schema = JSONField(default=dict)
    activity_schema = JSONField(default=dict)
    #  TODO: custom icon

    def __str__(self) -> str:
        return self.slug


def _gen_item_token():
    return f"I_{gen_token()}"


class Item(TimeStampedModel):
    token: "TextField[str, str]" = TextField(default=_gen_item_token, unique=True)
    info = JSONField(default=dict)
    rating: "models.FloatField[float, float]" = models.FloatField(
        null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(1)]
    )
    notes: "TextField[str, str]" = TextField(blank=True)
    item_type = models.ForeignKey(ItemType, on_delete=models.CASCADE)
    user: "models.ForeignKey[User, User]" = models.ForeignKey(
        User, on_delete=models.CASCADE
    )

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

    info = JSONField(default=dict)
