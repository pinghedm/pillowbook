# Generated by Django 5.0 on 2023-12-26 21:03

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0005_alter_activity_end_time_alter_activity_start_time"),
    ]

    operations = [
        migrations.AddField(
            model_name="item",
            name="user",
            field=models.ForeignKey(
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                to=settings.AUTH_USER_MODEL,
            ),
            preserve_default=False,
        ),
    ]