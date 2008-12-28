from django.db import models
from django.contrib.auth.models import User
from random import randrange
from Crypto.Cipher import Blowfish
from base64 import b64encode, b64decode

class Notice(models.Model):
    user = models.ForeignKey(User)
    content = models.TextField()
    reply_to_id = models.IntegerField()
    created_at = models.DateTimeField()

class Account(models.Model):
    @staticmethod
    def encrypt_password(username, password_text):
        c = Blowfish.new(username)
        return b64encode(c.encrypt(Account.__pad(password_text)))

    @staticmethod
    def decrypt_password(username, crypted_text):
        c = Blowfish.new(username)
        return Account.__depad(c.decrypt(b64decode(crypted_text)))

    @staticmethod
    def __pad(input):
        return input + "".join(["\n" for i in xrange(8 - len(input) % 8)])

    @staticmethod
    def __depad(input):
        return input.rstrip("\n")

    user = models.ForeignKey(User)
    service_id = models.CharField(max_length=255)
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    enabled = models.BooleanField(default=True)
    post_only = models.BooleanField(default=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField(null=True)

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
