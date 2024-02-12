from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.core.cache import cache

from .models import Node, Target


'''THIS PAGE IS A WORK-IN-PROGRESS, and not linked to by any link on the primary site.'''


funcs = {}


def userpage(request):
    if not request.user.is_authenticated:
        return render(request, 'forest/landing.html')

    if request.method == 'POST':
        action = request.POST.get('action')
        try:
            return funcs[action](request)
        except KeyError:
            response = {
                'Keys Error': True,
            }
            return JsonResponse(response)

    users = []
    targets = Target.objects.filter(user=request.user)
    for target in targets:
        node = target.node
        author = node.author.username
        if author not in users:
            users.append(author)

    context = {
        'users': users,
    }

    return render(request, 'forest/userview.html', context)


def name_clicked(request):
    user = request.user
    name = request.POST.get('username')
    print(user, name)

    try:
        user = User.objects.get(username=user)
    except User.DoesNotExist:
        response = {
            'action':'name_clicked_error',
            'error':'User does not exist',
        }
        return JsonResponse(response)
    
    try:
        name = User.objects.get(username=name)
    except User.DoesNotExist:
        response = {
            'action':'name_clicked_error',
            'error':'Target User does not exist',
        }
        return JsonResponse(response)

    inbox = []
    targets = Target.objects.filter(user=user, node__author=name)
    for target in targets:
        inbox.append(target.node.id)

    response = {
        'action':'name_clicked',
        'nodes': inbox,
    }
    return JsonResponse(response)


def send_node(node_id):
    node = get_object_or_404(Node, pk=node_id)
    members = []
    read = []
    targets = Target.objects.filter(node=node)
    for target in targets:
        members.append(target.user.username)
        read.append(target.read)

    response = {
        'action': 'send_node',
        'path': node.path,
        'node_id': int(node.id),
        'base_id': int(node.base.id) if node.base else -1,
        'content': node.content,
        'folder': node.folder,
        'created_on': node.created_on.strftime('%b %d, %Y, %I:%M %p'),
        'author': node.author.username,
        'members': members,
        'read': read,
    }
    return JsonResponse(response)



def get_node(request):
    node_id = request.POST.get('node_id')
    return send_node(node_id)


funcs['name_clicked'] = name_clicked
funcs['get_node'] = get_node


