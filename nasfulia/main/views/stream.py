from django.http import *
import httplib2
from nasfulia.main.models import Account
import simplejson
from nasfulia.main.lib.display import *

def index(request, format, username):
    accounts = request.session.get('accounts')
    notices = []
    # Create a Service subclass instance based on the
    # service_id of the account, grab the notices for
    # that account
    for account in accounts:
        constr = __services[account.service_id]['constructor']
        service = constr(account)
        notices.extend(service.fetch())
    return display_data(notices, format)

class Service():
    def __init__(self, account):
        self.account = account

class Twitter(Service):

    service_id = 'http://twitter.com/'
    service_name = 'Twitter'

    def __init__(self, account):
        Service.__init__(self, account)

    def fetch(self):
        account = self.account
        url = 'http://twitter.com/statuses/friends_timeline.json'
        http = httplib2.Http()
        password = Account.decrypt_password(account.username,
            account.password)
        http.add_credentials(account.username, password)
        response, content = http.request(url)
        notices = simplejson.loads(content)
        # Append the account definition to each notice
        for notice in notices:
            notice['account'] = {
                'service_id': self.service_id,
                'service_name': self.service_name,
                'username': account.username
            }
        return notices

class Identica(Service):

    service_id =  'http://identi.ca',
    service_name = 'Identica',

    def __init__(self, account):
        Service.__init__(self, account)

    def fetch(self):
        pass

__services = {
  'http://twitter.com/': {
    'constructor': Twitter
  },
  'http://identi.ca/': {
    'constructor': Identica
  }
}
