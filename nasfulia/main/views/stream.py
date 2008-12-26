from django.http import *

def index(request, format, username):
    accounts = request.session.get('accounts')
    # Create a Service subclass instance based on the
    # service_id of the account, grab the notices for
    # that account
    def fetch_notices(account):
        constr = __services[account.service_id]['constructor']
        print constr.__name__
        service = constr(account)
        print service.account.username
    
    map(fetch_notices, accounts)
    return HttpResponse('stream for ' + username)

class Service():
    def __init__(self, account):
        self.account = account

class Twitter(Service):
    def __init__(self, account):
        Service.__init__(self, account)

class Identica(Service):
    def __init__(self, account):
        Service.__init__(self, account)

__services = {
  'http://twitter.com/': {
    'service_id': 'http://twitter.com/',
    'service_name': 'Twitter',
    'constructor': Twitter
  },
  'http://identi.ca/': {
    'service_id': 'http://identi.ca',
    'service_name': 'Identica',
    'constructor': Identica
  }
}
