
class Dispatcher:
    def __init__(self, member_class):
        self.member_class = member_class

    def dispatch(self, request, *a, **kw):
        member_item = self.member_class()
        if kw.has_key('id'):
            if request.method == 'GET':
                return member_item.show(request, *a, **kw)
            elif request.method == 'PUT':
                return member_item.update(request, *a, **kw)
            elif request.method == 'DELETE':
                return member_item.delete(request, *a, **kw)
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

