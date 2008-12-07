from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.http import Http404
from django.core import serializers
from django.shortcuts import render_to_response
from django.contrib.auth.models import User
from nasfulia.main.models import Account

def home(request):
    id = request.session.get('_auth_user_id')
    user = User.objects.get(id=id)
    accounts = Account.objects.filter(user__id=id)
    request.session['accounts'] = accounts
    accounts = serializers.serialize('json', accounts)
    return render_to_response('home.html', {'accounts': accounts})

def profile(request):
    return HttpResponseRedirect('/home')
