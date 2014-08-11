from django.conf.urls import patterns, url

from guides import views

urlpatterns = patterns('',
    url(r'^$', views.index)
)