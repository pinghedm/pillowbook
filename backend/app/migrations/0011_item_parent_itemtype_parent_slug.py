# Generated by Django 5.0 on 2024-01-07 18:16

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0010_itemtype_auto_complete_config"),
    ]

    operations = [
        migrations.AddField(
            model_name="item",
            name="parent",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="app.item",
            ),
        ),
        migrations.AddField(
            model_name="itemtype",
            name="parent_slug",
            field=models.SlugField(blank=True, max_length=200, null=True),
        ),
    ]
