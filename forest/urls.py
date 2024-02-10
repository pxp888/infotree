from . import views, userview
from django.urls import path

urlpatterns = [
    path('', views.homepage, name='home'),
    path('userpage/', userview.userpage, name='userpage'),
]


