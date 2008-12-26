from django.http import *
from django.forms import ModelForm
from restful_dispatcher import Dispatcher
from django.db import models
from nasfulia.main import models as nasfulia_models
from django.contrib.auth.models import User
from datetime import datetime
from nasfulia.main.lib.display import *

class Notice:
    def index(self, request, format, username):
        # Can't use the login_required decorator
        # because it hijacks the 'next' redirect after login
        if request.user.is_authenticated():
            # File extension -- json/xml
            if format:
              notices = []
              notices = format_data(notices, 'notice', True)
              return display_data(notices, format)
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
            notice = {} 
            return display_data(notice, format)
        else:
            return HttpResponseForbidden(
                'Forbidden: Whoops, you need to be logged in for this.')

    def show(self, request, format, username, id):
        notice = {}
        notice = format_data(notice, 'notice', False)
        return display_data(notice, format)

    def update(self, request, format, username, id):
        return HttpResponse('upate ' + username + ' -- ' + id)

    def delete(self, request, format, username, id):
        if request.user.is_authenticated():
            pass
        else:
            return HttpResponseForbidden(
                'Forbidden: Whoops, you need to be logged in for this.')


# RESTful dispatch wrapper
dispatcher = Dispatcher(Notice)
def dispatch(request, *a, **kw):
    return dispatcher.dispatch(request, *a, **kw)

class HttpResponseNotAcceptable(HttpResponse):
    status_code = 406

