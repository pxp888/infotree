from django.shortcuts import render
from .models import Tree, Node, Target


# Create your views here.
def homepage(request):
    return render(request, 'forest/home.html')


def compose(request):
    return render(request, 'forest/compose.html')

