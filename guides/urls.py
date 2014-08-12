from django.conf.urls import patterns, url

from guides import views

urlpatterns = patterns('',
    # url(r'^$', views.index)

    # ex: /guides/1/
    url(r'^(?P<guide_id>\d+)/$', views.guide)
)