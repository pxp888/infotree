from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.core.cache import cache

from .models import Node, Target

funcs = {}

# Create your views here.
def homepage(request):
    if not request.user.is_authenticated:
        return render(request, 'forest/landing.html')

    if request.method == 'POST':
        action = request.POST.get('action')
        try:
            return funcs[action](request)
        except KeyError:
            response = {
                'Key Error': True,
            }
            return JsonResponse(response)

    context = {
        
    }

    return render(request, 'forest/home.html', context)


def send_node(node_id):


def add_root_folder(request):
    author = request.user
    path = request.POST.get('path')

    node = Node.objects.create(author=author, path=path, folder=True, base=None)
    node.save()
    target = Target.objects.create(node=node, target=author, read=True)
    target.save()

    send_node(node_id)


funcs['add_root_folder'] = add_root_folder


