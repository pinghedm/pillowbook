# Generated by Django 5.0 on 2023-12-26 15:55

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0002_item_user_token_activity"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="is_staff",
            field=models.BooleanField(default=False),
        ),
    ]
