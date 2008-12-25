from django.http import *
from django.shortcuts import render_to_response
from django.forms import ModelForm
from restful_dispatcher import Dispatcher
from django.db import models
from nasfulia.main import models as nasfulia_models
from django.contrib.auth.models import User
from datetime import datetime
from random import randrange
from Crypto.Cipher import Blowfish
from base64 import b64encode, b64decode
from nasfulia.main.lib.display import *


class Account:
    def __encrypt_password(self, username, password_text):
        c = Blowfish.new(username)
        return b64encode(c.encrypt(self.__pad(password_text)))

    def __decrypt_password(self, username, crypted_text):
        c = Blowfish.new(username)
        return self.__depad(c.decrypt(b64decode(crypted_text)))

    def __pad(self, input):
        return input + "".join(["\n" for i in xrange(8 - len(input) % 8)])

    def __depad(self, input):
        return input.rstrip("\n")

    def index(self, request, format, username):
        # Can't use the login_required decorator
        # because it hijacks the 'next' redirect after login
        if request.user.is_authenticated():
            accounts = request.session['accounts']
            # File extension -- json/xml
            if format:
              accounts = format_data(accounts, 'account', True)
              return display_data(accounts, format)
            # No extension, render template
            else:
                return HttpResponseNotAcceptable('Not a supported format.')
        else:
            return HttpResponseForbidden(
                'Forbidden: Sorry, Charlie, you must be logged in to see this.')

    def create(self, request, format, username):
        # Can't use the login_required decorator
        # because it hijacks the 'next' redirect after login
        if request.user.is_authenticated():
            user_id = request.session.get('_auth_user_id')
            # Create an Account instance, link to User
            account = nasfulia_models.Account()
            user = User.objects.get(id=user_id)
            account.user = user
            # Set created_at timestamp
            account.created_at = datetime.now()
            # Pass to ModelForm with POST data for validation
            form = AccountForm(data=request.POST, instance=account)
            if form.is_valid():
                # Encrypt the password
                form.cleaned_data['password'] = self.__encrypt_password(
                    user.username, form.cleaned_data['password'])
                # Save the new account
                acct = form.save()
                # Refresh cached account data
                accounts = nasfulia_models.Account.objects.filter(user__id=user_id)
                request.session['accounts'] = accounts
                # Return the saved account
                ret = {
                    "id": acct.id,
                    "service_id": acct.service_id,
                    "username": acct.username,
                    "enabled": acct.enabled,
                    "post_only": acct.post_only
                }
                if format == 'xml':
                    ret = pyxslt.serialize.toString(prettyPrintXml=True, accounts=ret)
                elif format == 'json':
                    ret = simplejson.dumps(ret)
                return HttpResponse(ret, mimetype='application/' + format)
            else:
                # print form.errors
                return HttpResponse('error creating ' + username)
        else:
            return HttpResponseForbidden(
                'Forbidden: Whoops, you need to be logged in for this.')

    def show(self, request, format, username, id):
        account = nasfulia_models.Account.objects.get(id=id)
        account = format_data(account, 'account', False)
        return display_data(account, format)

    def update(self, request, format, username, id):
        return HttpResponse('upate ' + username + ' -- ' + id)

    def delete(self, request, format, username, id):
        if request.user.is_authenticated():
            account = nasfulia_models.Account.objects.get(id=id)
            user_id = request.session.get('_auth_user_id')
            if account.user_id == user_id:
                account.delete()
                # Refresh cached account data
                accounts = nasfulia_models.Account.objects.filter(user__id=user_id)
                request.session['accounts'] = accounts
                account = {"id": id}
                return display_data(account, format)
            else:
                return HttpResponseForbidden(
                    'This is not your account, dude..')
        else:
            return HttpResponseForbidden(
                'Forbidden: Whoops, you need to be logged in for this.')


# RESTful dispatch wrapper
dispatcher = Dispatcher(Account)
def dispatch(request, *a, **kw):
    return dispatcher.dispatch(request, *a, **kw)

class AccountForm(ModelForm):
    class Meta:
        model = nasfulia_models.Account
        exclude = ('user', 'created_at', 'updated_at')

class HttpResponseNotAcceptable(HttpResponse):
    status_code = 406
