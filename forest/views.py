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
        members.append(target.target.username)
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


def add_node(request):
    user = request.user
    path = request.POST.get('path')
    isfolder = request.POST.get('isfolder')
    content = request.POST.get('content')

    if isfolder == 'true':
        isfolder = True
    else:
        isfolder = False

    try:
        old = Node.objects.get(path=path, author=user)
        response = {
            'action': 'error',
            'error': 'Node already exists',
            'path': old.path,
            'author': old.author.username,
        }
        return JsonResponse(response)
    except Node.DoesNotExist:
        pass

    try:
        bpath = path.split('/')[:-2]
        bpath = '/'.join(bpath) + '/'
        print(bpath)
        base = Node.objects.get(path=bpath, author=user)
    except Node.DoesNotExist:
        print('Root Item')
        base = None

    node = Node.objects.create(path=path, author=user, folder=isfolder, content=content, base=base)
    target = Target.objects.create(node=node, target=user, read=True)
    target.save()
    node.save()
    
    return send_node(node.id)


def get_folders(request):
    user = request.user

    targets = Target.objects.filter(target=user, node__folder=True)
    folders = []
    for target in targets:
        path = target.node.path
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


def get_nodes(request):
    user = request.user
    base_id = request.POST.get('base_id')
    targets = Target.objects.filter(target=user, node__base=base_id)
    nodes = []
    for target in targets:
        nodes.append(target.node.id)
    response = {
        'action': 'get_nodes',
        'nodes': nodes,
    }
    return JsonResponse(response)


def get_node(request):
    user = request.user
    node_id = request.POST.get('node_id')
    return send_node(node_id)


def add_member(request):
    user = request.user
    node_id = request.POST.get('node_id')
    member = request.POST.get('member')

    try:
        new_member = User.objects.get(username=member)
    except User.DoesNotExist:
        response = {
            'action': 'error',
            'error': 'User does not exist',
        }
        return JsonResponse(response)
    
    node = Node.objects.get(pk=node_id)
    target = Target.objects.create(node=node, target=new_member, read=False)
    target.save()
    return send_node(node_id)


def send_message(request):
    user = request.user
    base_id = request.POST.get('base_id')
    content = request.POST.get('content')
    print(base_id, content)

    try:
        base = Node.objects.get(pk=base_id)
    except Node.DoesNotExist:
        response = {
            'action': 'error',
            'error': 'Basenode does not exist',
        }
        return JsonResponse(response)
    
    new_node = Node.objects.create(author=user, content=content, base=base)
    new_node.path = base.path + 'm' + str(new_node.id) + '/'
    new_node.save()

    targets = Target.objects.filter(node=base)
    for target in targets:
        if target.target != user:
            new_target = Target.objects.create(node=new_node, target=target.target, read=False)
        else:
            new_target = Target.objects.create(node=new_node, target=target.target, read=True)
        new_target.save()
    
    return send_node(new_node.id)


def mark_read(request):
    user = request.user
    node_id = request.POST.get('node_id')
    node = Node.objects.get(pk=node_id)
    target = Target.objects.get(node=node, target=user)
    target.read = True
    target.save()
    response = {
        'action': 'mark_read',
        'node_id': node_id,
    }
    return JsonResponse(response)


funcs['add_node'] = add_node
funcs['get_folders'] = get_folders
funcs['get_folder'] = get_folder
funcs['get_nodes'] = get_nodes
funcs['get_node'] = get_node
funcs['add_member'] = add_member
funcs['send_message'] = send_message
funcs['mark_read'] = mark_read




