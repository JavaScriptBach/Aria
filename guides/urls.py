from django.conf.urls import patterns, url

from guides import views

urlpatterns = patterns('',
    # url(r'^$', views.index)

    # ex: /guides/1/
    url(r'^(?P<pk>\d+)/$', views.DetailView.as_view()),

    # ex: /guides/create
    url(r'^create/$', views.create),

    # ex: /guides/create/submit
    url(r'^create/submit/$', views.submit_guide)
)