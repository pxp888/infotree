# Generated by Django 4.2.1 on 2024-02-05 11:19

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("forest", "0003_node_folder_delete_folder"),
    ]

    operations = [
        migrations.AddField(
            model_name="node",
            name="base",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="forest.node",
            ),
        ),
    ]