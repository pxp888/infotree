from . import views
from django.urls import path

urlpatterns = [
    path('', views.homepage, name='home'),
    path('compose/', views.compose, name='compose'),
]


