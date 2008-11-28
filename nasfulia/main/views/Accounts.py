from django.http import HttpResponse
from django.http import Http404

class dispatcher:
    def __init__(self, member_class):
        self.member_class = member_class

    def dispatch(self, request, *a, **kw):
        member_item = self.member_class()
        if kw.has_key('id'):
            if request.method == 'GET':
                return member_item.show(request, *a, **kw)
            else:
                if request.has_key('_action'):
                    if request.POST['_action'].lower() == 'put':
                        return member_item.PUT(request, *a, **kw)
                    elif request.POST['_action'].lower() == 'delete':
                        return member_item.DELETE(request, *a, **kw)

        else:
            if request.method == 'GET':
                return member_item.index(request, *a, **kw)
            else:
                return member_item.create(request, *a, **kw)

        raise Http404

def GET(request, user_id):
    return HttpResponse('Yay, ' + user_id)

def POST(request):
    # to help with initial debugging...
    return HttpResponse('POST: Accounts')

class Account:
    def index(self, request, user_id):
        return HttpResponse('index ' + user_id)

    def create(self, request, user_id):
        return HttpResponse('create ' + user_id)

    def show(self, request, user_id, id):
        return HttpResponse('show ' + user_id + ' -- ' + id)

dispatcher = dispatcher(Account)
def dispatch(request, *a, **kw):
    return dispatcher.dispatch(request, *a, **kw)


