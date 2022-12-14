# Generated by Django 3.1.6 on 2022-10-16 20:13

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.db.models.manager


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Document',
            fields=[
                ('document_id', models.AutoField(primary_key=True, serialize=False)),
                ('description', models.CharField(max_length=255, unique=True)),
                ('document', models.FileField(upload_to='documents/')),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='tbl_Authentication',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Empcode', models.IntegerField()),
                ('username', models.CharField(default='', max_length=50)),
                ('password', models.CharField(default='', max_length=50)),
                ('is_active', models.IntegerField(null=True)),
            ],
            managers=[
                ('empAuth_objects', django.db.models.manager.Manager()),
            ],
        ),
        migrations.CreateModel(
            name='Commentary',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('document_name', models.CharField(max_length=200)),
                ('comment_id', models.IntegerField(blank=True)),
                ('user_id', models.CharField(blank=True, max_length=100)),
                ('date', models.DateTimeField(blank=True)),
                ('thread', models.IntegerField(blank=True)),
                ('comment_level', models.IntegerField(blank=True)),
                ('comment', models.CharField(max_length=5000)),
                ('argumentation', models.IntegerField(blank=True)),
                ('constructivity', models.IntegerField(blank=True)),
                ('positive_stance', models.IntegerField(blank=True)),
                ('negative_stance', models.IntegerField(blank=True)),
                ('target_person', models.IntegerField(blank=True)),
                ('target_group', models.IntegerField(blank=True)),
                ('stereotype', models.IntegerField(blank=True)),
                ('sarcasm', models.IntegerField(blank=True)),
                ('mockery', models.IntegerField(blank=True)),
                ('insult', models.IntegerField(blank=True)),
                ('improper_language', models.IntegerField(blank=True)),
                ('aggressiveness', models.IntegerField(blank=True)),
                ('intolerance', models.IntegerField(blank=True)),
                ('toxicity', models.IntegerField(blank=True)),
                ('toxicity_level', models.IntegerField(blank=True)),
                ('document_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='DataVisualization.document')),
            ],
        ),
        migrations.CreateModel(
            name='ChatProfile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('age', models.IntegerField(blank=True, null=True)),
                ('nickname', models.CharField(blank=True, max_length=100)),
                ('first_login', models.BooleanField()),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]