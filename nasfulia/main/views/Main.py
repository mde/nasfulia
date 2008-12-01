from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.http import Http404
from django.shortcuts import render_to_response
from django.contrib.auth.models import User
from nasfulia.main.models import Account

def home(request):
    return render_to_response('home.html', {})

def profile(request):
    id = request.session.get('_auth_user_id')
    user = User.objects.get(id=id)
    accounts = Account.objects.filter(user__id=id)
    request.session['accounts'] = accounts
    # User has service accounts set up, send them
    # into the app
    if len(accounts) > 0:
        return render_to_response('home.html', {})
    # Otherwise they need to set up some accounts
    else:
        return HttpResponseRedirect('/users/' +
            user.username + '/accounts')


