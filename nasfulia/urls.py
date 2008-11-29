from django.conf.urls.defaults import *

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Example:
    # (r'^nasfulia/', include('nasfulia.foo.urls')),

    # Uncomment the admin/doc line below and add 'django.contrib.admindocs'
    # to INSTALLED_APPS to enable admin documentation:
    # (r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # (r'^admin/(.*)', admin.site.root),
    (r'^users/(?P<user_id>[^\/]+)/accounts$', 'nasfulia.main.views.Accounts.dispatch'),
    (r'^users/(?P<user_id>[^\/]+)/accounts/(?P<id>\d+)$', 'nasfulia.main.views.Accounts.dispatch'),
    (r'^login/$', 'django.contrib.auth.views.login'),
    (r'^home$', 'nasfulia.main.views.Main.home'),
)

