from typing import Any
from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):

    """Define a model manager for User model with no username field."""

    use_in_migrations = True

    def _create_user(self, email: str, password: str, **extra_fields: dict[str, Any]):
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_user(self, email: str, password: str, **extra_fields: dict[str, Any]):
        return self._create_user(email, password, **extra_fields)

    def create_superuser(
        self, email: str, password: str, **extra_fields: dict[str, Any]
    ):
        return self._create_user(email, password, **extra_fields)
