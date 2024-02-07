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
        'base_id': int(node.base.id) if node.base else 0,
        'content': node.content,
        'folder': node.folder,
        'created_on': node.created_on.strftime('%b %d, %Y, %I:%M %p'),
        'author': node.author.username,
        'members': members,
        'read': read,
    }
    return JsonResponse(response)


def add_root_folder(request):
    author = request.user
    path = request.POST.get('path')

    node = Node.objects.create(author=author, path=path, folder=True, base=None)
    node.save()
    target = Target.objects.create(node=node, user=author, read=True)
    target.save()

    return send_node(node.id)


def add_subfolder(request):
    author = request.user
    path = request.POST.get('path')
    base_id = request.POST.get('base_id')

    base = Node.objects.get(id=base_id)
    node = Node.objects.create(author=author, path=path, folder=True, base=base)
    node.save()
    target = Target.objects.create(node=node, user=author, read=True)
    target.save()
    return send_node(node.id)


def get_folders(request):
    user = request.user
    targets = Target.objects.filter(user=user, node__folder=True)
    folders = []
    for target in targets:
        folders.append(target.node.id)
    response = {
        'action': 'get_folders',
        'folders': folders,
    }
    return JsonResponse(response)


def get_folder(request):
    user = request.user
    node_id = request.POST.get('node_id')
    return send_node(node_id)


def delete_folder(request):
    user = request.user
    node_id = request.POST.get('node_id')

    try:
        target = Target.objects.get(node__id=node_id, user=user)
        target.delete()
    except Target.DoesNotExist:
        response = {
            'action': 'delete_folder',
            'deleted': False,
        }
        return JsonResponse(response)

    try:
        targets = Target.objects.filter(node__id=node_id)
    except Target.DoesNotExist:
        node = Node.objects.get(id=node_id)
        node.delete()
    if len(targets) == 0:
        node = Node.objects.get(id=node_id)
        node.delete()
    
    response = {
        'action': 'delete_folder',
        'deleted': True,
    }
    return JsonResponse(response)


def add_member(request):
    node_id = request.POST.get('node_id')
    member = request.POST.get('member')

    try:
        target = Target.objects.get(node__id=node_id, user__username=member)
        response = {
            'action': 'add_member',
            'added': False,
            'reason': 'already a member',
        }
        return JsonResponse(response)
    except Target.DoesNotExist:
        pass
    
    target = Target.objects.create(node_id=node_id, user=User.objects.get(username=member), read=False)
    target.save()
    return send_node(node_id)





funcs['add_root_folder'] = add_root_folder
funcs['get_folders'] = get_folders
funcs['get_folder'] = get_folder
funcs['delete_folder'] = delete_folder
funcs['add_member'] = add_member
funcs['add_subfolder'] = add_subfolder



