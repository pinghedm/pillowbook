# Generated by Django 5.0 on 2024-01-10 03:28

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0012_itemtype_icon"),
    ]

    operations = [
        migrations.AddField(
            model_name="activity",
            name="pending",
            field=models.BooleanField(default=False),
        ),
    ]
