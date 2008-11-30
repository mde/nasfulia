from django.db import models
from django.contrib.auth.models import User

class Notice(models.Model):
    user = models.ForeignKey(User)
    content = models.TextField()
    reply_to_id = models.IntegerField()
    created_at = models.DateTimeField()

class Account(models.Model):
    user = models.ForeignKey(User)
    service_id = models.CharField(max_length=255)
    username = models.CharField(max_length=255)
    crypted_password = models.CharField(max_length=255)
    enabled = models.BooleanField(default=True)
    post_only = models.BooleanField(default=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

class Track(models.Model):
    user = models.ForeignKey(User)
    service_id = models.CharField(max_length=255)
    text = models.TextField()
    enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

class Profile(models.Model):
    user = models.ForeignKey(User, unique=True)
    profile_image_url = models.CharField(max_length=255)
    description  = models.CharField(max_length=255)
    location  = models.CharField(max_length=255)
    url =  models.CharField(max_length=255)
