from . import views
from django.urls import path

urlpatterns = [
    path('compose/', views.compose, name='compose'),
    path('', views.homepage, name='home'),
    # path('branch/<int:id>', views.branchview, name='branchview'),
]


