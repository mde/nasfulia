from django.http import HttpResponse
from django.http import Http404
from django.shortcuts import render_to_response
from django.core import serializers
from django.forms import ModelForm
from restful_dispatcher import Dispatcher
from django.db import models
from nasfulia.main import models as nasfulia_models
from django.contrib.auth.models import User
from datetime import datetime

class Account:
    def index(self, request, format, user_id):
        accounts = request.session['accounts']
        # File extension -- json/xml
        if format:
            accounts = serializers.serialize(format, accounts)
            return HttpResponse(accounts, mimetype='application/' + format)
        # No extension, render template
        else:
            return render_to_response('accounts/index.html', {
                'request': request,
                'accounts': accounts,
                'user_id': user_id })

    def create(self, request, format, user_id):
        d = request.POST.copy() # Figures, POST data is immutable
        d['created_at'] = datetime.now()
        account = nasfulia_models.Account()
        id = request.session.get('_auth_user_id')
        user = User.objects.get(id=id)
        account.user = user
        form = AccountForm(data=d, instance=account)
        if form.is_valid():
            form.save()
            return HttpResponse('created account for ' + user_id)
        else:
            print form.errors
            return HttpResponse('error creating ' + user_id)

    def show(self, request, format, user_id, id):
        return HttpResponse('show ' + user_id + ' -- ' + id)

    def update(self, request, format, user_id, id):
        return HttpResponse('upate ' + user_id + ' -- ' + id)

    def delete(self, request, format, user_id, id):
        return HttpResponse('delete ' + user_id + ' -- ' + id)

dispatcher = Dispatcher(Account)
def dispatch(request, *a, **kw):
    return dispatcher.dispatch(request, *a, **kw)

class AccountForm(ModelForm):
    class Meta:
        model = nasfulia_models.Account
        exclude = ('user', 'updated_at')

