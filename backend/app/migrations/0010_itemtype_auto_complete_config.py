# Generated by Django 5.0 on 2023-12-28 17:39

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0009_itemtype_user_alter_activity_info_alter_item_info_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="itemtype",
            name="auto_complete_config",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
