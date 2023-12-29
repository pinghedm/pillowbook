# Generated by Django 5.0 on 2023-12-28 16:42

import app.models
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0008_user_settings"),
    ]

    operations = [
        migrations.AddField(
            model_name="itemtype",
            name="user",
            field=models.ForeignKey(
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                to=settings.AUTH_USER_MODEL,
            ),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="activity",
            name="info",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AlterField(
            model_name="item",
            name="info",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AlterField(
            model_name="itemtype",
            name="activity_schema",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AlterField(
            model_name="itemtype",
            name="item_schema",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AlterField(
            model_name="itemtype",
            name="slug",
            field=models.SlugField(max_length=200, unique=True),
        ),
        migrations.AlterField(
            model_name="user",
            name="settings",
            field=models.JSONField(
                blank=True, default=app.models._default_user_settings
            ),
        ),
    ]