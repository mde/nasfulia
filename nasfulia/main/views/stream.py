from django.http import *
import httplib2
from nasfulia.main.models import Account
import simplejson
from nasfulia.main.lib.display import *

def index(request, format, username):
    accounts = request.session.get('accounts')
    ret = {}
    notices = []
    errors = []
    # Create a Service subclass instance based on the
    # service_id of the account, grab the notices for
    # that account
    for account in accounts:
        constr = __services[account.service_id]['constructor']
        service = constr(account)
        try:
            notices.extend(service.fetch())
        except Exception, err:
            status, content = err
            errors.append({
                'status': status,
                'message': content,
                'account': {
                    'service_id': service.service_id,
                    'service_name': service.service_name,
                    'username': account.username
                }
            })
    ret['notices'] = notices
    if len(errors) > 0:
        ret['errors'] = errors
    return display_data(ret, format)

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
        if response['status'] == '200':
            notices = simplejson.loads(content)
            # Append the account definition to each notice
            for notice in notices:
                notice['account'] = {
                    'service_id': self.service_id,
                    'service_name': self.service_name,
                    'username': account.username
                }
            return notices
        else:
            raise Exception(response['status'], content)

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
