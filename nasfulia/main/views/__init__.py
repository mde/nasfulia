from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.http import Http404
from django.core import serializers
from django.shortcuts import render_to_response
from django.contrib.auth.models import User
from nasfulia.main.models import Account
import simplejson

def home(request):
    accounts = request.session['accounts']
    ret = []
    def map_acct(acct):
        ret.append({
            "id": acct.id,
            "service_id": acct.service_id,
            "username": acct.username,
            "enabled": acct.enabled,
            "post_only": acct.post_only
        })
    map(map_acct, accounts)
    ret = simplejson.dumps(ret)
    return render_to_response('home.html', {'accounts': ret})

def profile(request):
    # Stick the social-network accounts into the session,
    # they're used on just about every request
    id = request.session.get('_auth_user_id')
    accounts = Account.objects.filter(user__id=id)
    request.session['accounts'] = accounts
    return HttpResponseRedirect('/home')
