# Generated by Django 5.0 on 2024-01-19 23:30

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0013_activity_pending"),
    ]

    operations = [
        migrations.AddField(
            model_name="item",
            name="pinned",
            field=models.BooleanField(default=False),
        ),
    ]
