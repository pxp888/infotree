from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.core.cache import cache

from .models import Node, Target

'''the funcs dict holds ajax functions that are called from the homepage view'''
funcs = {}

'''this serves the home page'''
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


'''send all relevant information for a single node'''
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


'''create a top level folder node'''
def add_root_folder(request):
    author = request.user
    path = request.POST.get('path')

    node = Node.objects.create(author=author, path=path, folder=True, base=None)
    node.save()
    target = Target.objects.create(node=node, user=author, read=True)
    target.save()

    return send_node(node.id)


'''create a folder node with a parent node'''
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


'''return a list of folder nodes that belong to the user'''
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


'''return data for a single folder node'''
def get_folder(request):
    user = request.user
    node_id = request.POST.get('node_id')
    return send_node(node_id)


'''remove a users association with a folder node, and delete the node if no users remain'''
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


'''add a user to a folder node'''
def add_member(request):
    node_id = request.POST.get('node_id')
    member = request.POST.get('member')

    try:
        targetuser = User.objects.get(username=member)
    except User.DoesNotExist:
        response = {
            'action': 'add_member_error',
            'added': False,
            'reason': 'user does not exist',
        }
        return JsonResponse(response)

    try:
        target = Target.objects.get(node__id=node_id, user__username=member)
        response = {
            'action': 'add_member_error',
            'added': False,
            'reason': 'already a member',
        }
        return JsonResponse(response)
    except Target.DoesNotExist:
        pass
    
    target = Target.objects.create(node_id=node_id, user=User.objects.get(username=member), read=False)
    target.save()
    return send_node(node_id)


'''create a message node, and target entries for each targeted user'''
def send_message(request):
    user = request.user
    content = request.POST.get('content')
    base_id = request.POST.get('base_id')

    base = Node.objects.get(id=base_id)
    node = Node.objects.create(author=user, content=content, base=base)
    node.save()
    
    targets = Target.objects.filter(node=base)
    users = []
    for target in targets:
        user = target.user
        cache.delete(user.username)
        print('cleared cache for', user.username)
        if user != request.user:
            new_target = Target.objects.create(node=node, user=user, read=False)
        else:
            new_target = Target.objects.create(node=node, user=user, read=True)
        new_target.save()
    return send_node(node.id)


'''return a list of nodes for a given parent node'''
def get_nodes(request):
    user = request.user
    base_id = request.POST.get('base_id')
    node_count = request.POST.get('node_count')
    
    node_count = int(node_count)
    print('node_count:', node_count)
    
    targets = Target.objects.filter(user=user, node__base__id=base_id).order_by('-node_id')[node_count:node_count+25]
    nodes = []
    for target in targets:
        nodes.append(target.node.id)

    response = {
        'action': 'get_nodes',
        'nodes': nodes,
    }
    return JsonResponse(response)


'''return data for a single node'''
def get_node(request):
    node_id = request.POST.get('node_id')
    return send_node(node_id)


'''check if a user has unread nodes'''
def update(request):
    user = request.user

    if cache.get(user.username) is not None:
        return cache.get(user.username)
    else:
        nodes = []
        folders = []
        targets = Target.objects.filter(user=user, read=False, node__folder=False)
        for target in targets:
            nodes.append(target.node.id)
            folders.append(target.node.base.id)

        response = {
            'action': 'update',
            'nodes': nodes,
            'folders': folders,
        }
        cache.set(user.username, JsonResponse(response), 600)
        return JsonResponse(response)


'''mark a target entry as read by user'''
def mark_read(request):
    user = request.user
    node_id = request.POST.get('node_id')
    cache.delete(user.username)
    try:
        target = Target.objects.get(user=user, node__id=node_id)
        target.read = True
        target.save()
    except Target.DoesNotExist:
        response = {
            'action': 'mark_read',
            'read': False,
        }
        return JsonResponse(response)

    response = {
        'action': 'mark_read',
        'read': True,
    }
    return JsonResponse(response)


funcs['add_root_folder'] = add_root_folder
funcs['get_folders'] = get_folders
funcs['get_folder'] = get_folder
funcs['delete_folder'] = delete_folder
funcs['add_member'] = add_member
funcs['add_subfolder'] = add_subfolder
funcs['send_message'] = send_message
funcs['get_nodes'] = get_nodes
funcs['get_node'] = get_node
funcs['update'] = update
funcs['mark_read'] = mark_read




