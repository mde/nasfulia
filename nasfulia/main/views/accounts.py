from django.http import HttpResponse
from django.http import Http404
from django.shortcuts import render_to_response
from django.core import serializers

class Dispatcher:
    def __init__(self, member_class):
        self.member_class = member_class

    def dispatch(self, request, *a, **kw):
        member_item = self.member_class()
        if kw.has_key('id'):
            if request.method == 'GET':
                return member_item.show(request, *a, **kw)
            elif request.method == 'PUT':
                pass
            elif request.method == 'DELETE':
                pass
            else:
                if request.has_key('_action'):
                    if request.POST['_action'].lower() == 'put':
                        return member_item.PUT(request, *a, **kw)
                    elif request.POST['_action'].lower() == 'delete':
                        return member_item.DELETE(request, *a, **kw)

        else:
            if request.method == 'GET':
                return member_item.index(request, *a, **kw)
            elif request.method == 'POST':
                return member_item.create(request, *a, **kw)

        raise Http404

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
        return HttpResponse('create ' + user_id)

    def show(self, request, format, user_id, id):
        return HttpResponse('show ' + user_id + ' -- ' + id)

dispatcher = Dispatcher(Account)
def dispatch(request, *a, **kw):
    return dispatcher.dispatch(request, *a, **kw)


