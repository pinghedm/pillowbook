import datetime

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db.models.fields import EmailField, DateTimeField

from app.utils.common_utils import gen_token
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
    objects = UserManager()

    @staticmethod
    def gen_token():
        return _gen_user_token()
