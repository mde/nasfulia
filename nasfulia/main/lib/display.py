from django.http import *
import simplejson
import pyxslt.serialize

# Whitelisted properties for display
__maps = {
  'account': [
      'id',
      'service_id',
      'username',
      'enabled',
      'post_only'
  ],
  'notice': [
  ],
  'track': [] 
}

def format_data(obj, obj_type, is_collection):
    data = []
    # Array of field names
    m = __maps[obj_type]

    # Iterate over each item in the collection and map
    # the whitelisted properties for the object type onto
    # Hash to be used as a data item
    def map_data_collection(coll_item):
        data_item = {}
        def map_data_item(f):
            # Scopeage -- eval breaks inner scope
            o = coll_item
            data_item[f] = eval('o.' + f)
        # Map the whitelisted properties for each item onto
        # the Hash item
        map(map_data_item, m)
        # Append to the list to be returned
        data.append(data_item)
    
    if is_collection:
        items = obj
        map(map_data_collection, items)
        ret = data # Use the list
    else:
        items = [obj]
        map(map_data_collection, items)
        ret = data[0] # Use the only item in the list
    return ret

def display_data(data, format):
    ret = data
    if format == 'xml':
        ret = pyxslt.serialize.toString(prettyPrintXml=True,
            data=ret)
    elif format == 'json':
        ret = simplejson.dumps(ret)
    return HttpResponse(ret, mimetype='application/' + format)


