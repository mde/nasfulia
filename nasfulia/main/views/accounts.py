from django.http import *
from django.forms import ModelForm
from restful_dispatcher import Dispatcher
from django.db import models
from nasfulia.main import models as nasfulia_models
from django.contrib.auth.models import User
from datetime import datetime
from nasfulia.main.lib.display import *

class Account:
    def index(self, request, format, username):
        # Can't use the login_required decorator
        # because it hijacks the 'next' redirect after login
        if request.user.is_authenticated():
            accounts = request.session.get('accounts')
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
                form.cleaned_data['password'] = nasfulia_models.Account.encrypt_password(
                    form.cleaned_data['username'], form.cleaned_data['password'])
                # Save the new account
                account = form.save()
                # Refresh cached account data
                accounts = nasfulia_models.Account.objects.filter(user__id=user_id)
                request.session['accounts'] = accounts
                # Format and return response
                account = format_data(account, 'account', False)
                return display_data(account, format)
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
                # Format and return response
                account = {"id": id}
                return display_data(account, format)
            else:
                return HttpResponseForbidden(
                    'This is not your account, dude.')
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
