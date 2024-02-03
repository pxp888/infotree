from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.core.cache import cache

from .models import Tree, Branch, Node, Target, Member

funcs = {}

# Create your views here.
def homepage(request):
    if not request.user.is_authenticated:
        return render(request, 'forest/landing.html')

    if request.method == 'POST':
        ptype = request.POST.get('ptype')
        try:
            return funcs[ptype](request)
        except KeyError:
            response = {
                'Key Error': True,
            }
            return JsonResponse(response)

    context = {
        
    }

    return render(request, 'forest/home.html', context)


'''Helper functions'''

def getUser(username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return None
    return user


def makeTargets(node, branch):
    members = Member.objects.filter(branch=branch)
    members = members.exclude(user=node.sender)

    for member in members:
        target = Target(node=node, target=member.user, branch=branch, tree=branch.tree)
        target.save()


'''AJAX functions'''

def send_tree(tree):
    response = {
        'ptype': 'send_tree',
        'tree_id': tree.id,
        'topic': tree.topic,
        'author': tree.author.username,
        'created_on': tree.created_on.strftime('%b %d, %Y, %I:%M %p'),
    }
    return JsonResponse(response)


def add_tree(request):
    topic = request.POST.get('topic')
    author = request.user
    tree = Tree(topic=topic, author=author)
    tree.save()
    return send_tree(tree)


def get_tree(request):
    tree_id = request.POST.get('tree_id')
    try:
        tree = Tree.objects.get(id=tree_id)
    except Tree.DoesNotExist:
        response = {
            'error':'Tree DoesNotExist',
        }
        return JsonResponse(response)

    return send_tree(tree)


def get_trees(request):
    user = request.user
    myTrees = {}

    trees = Tree.objects.filter(author=user)
    for tree in trees:
        myTrees[tree.id] = tree

    branches = Member.objects.filter(user=user)
    for branch in branches:
        myTrees[branch.tree.id] = branch.tree

    response = {
        'trees': list(myTrees.keys()),
    }
    return JsonResponse(response)


def send_branch(branch):
    try:
        member_objects = Member.objects.filter(branch=branch)
    except Exception as e:
        print(e)
        member_objects = []
    
    members = ''
    for member in member_objects:
        members += member.user.username + ', '
    members = members[:-2]

    response = {
        'ptype': 'send_branch',
        'tree_id': branch.tree.id,
        'branch_id': branch.id,
        'subject': branch.subject,
        'created_on': branch.created_on.strftime('%b %d, %Y, %I:%M %p'),
        'members': members,
    }
    return JsonResponse(response)


def add_branch(request):
    user = request.user
    tree_id = request.POST.get('tree_id')
    subject = request.POST.get('subject')

    tree = Tree.objects.get(id=tree_id)
    branch = Branch(tree=tree, subject=subject)
    branch.save()

    member = Member(tree=tree, branch=branch, user=user)
    member.save()

    return send_branch(branch)


def get_branches(request):
    tree_id = request.POST.get('tree_id')

    branch_objects = Branch.objects.filter(tree=tree_id)
    branch_ids = []
    for branch in branch_objects:
        branch_ids.append(branch.id)

    response = {
        'branches': branch_ids,
    }
    return JsonResponse(response)


def get_branch(request):
    branch_id = request.POST.get('branch_id')
    branch = Branch.objects.get(id=branch_id)

    return send_branch(branch)


def send_node(node):
    response = {
        'ptype': 'send_node',
        'node_id': node.id,
        'sender': node.sender.username,
        'content': node.content,
        'created_on': node.created_on.strftime('%b %d, %Y, %I:%M %p'),
        'branch_id': node.branch.id,
    }
    return JsonResponse(response)


def add_node(request):
    user = request.user
    branch_id = request.POST.get('branch_id')
    content = request.POST.get('content')

    branch = Branch.objects.get(id=branch_id)
    node = Node(sender=user, branch=branch, content=content, tree=branch.tree)
    node.save()

    makeTargets(node, branch)
    return send_node(node)


def get_node(request):
    node_id = request.POST.get('node_id')
    node = Node.objects.get(id=node_id)

    try:
        target = Target.objects.get(node=node, target=request.user, read=False)
        target.read = True
        target.save()
    except Target.DoesNotExist:
        pass 
    except Exception as e:
        print(e)

    return send_node(node)


def get_nodes(request):
    branch_id = request.POST.get('branch_id')
    nodes = Node.objects.filter(branch=branch_id)
    node_ids = []
    for node in nodes:
        node_ids.append(node.id)

    response = {
        'nodes': node_ids,
    }
    return JsonResponse(response)


def add_member(request):
    branch_id = request.POST.get('branch_id')
    username = request.POST.get('username')

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        response = {
            'error':'User DoesNotExist',
        }
        return JsonResponse(response)
    
    branch = Branch.objects.get(id=branch_id)

    try:
        old_member = Member.objects.get(branch=branch, user=user)
        print('Member already exists')
    except Member.DoesNotExist:
        member = Member(tree=branch.tree, branch=branch, user=user)
        member.save()

    return send_branch(branch)


def update(request):
    user = request.user
    current_branch_id = request.POST.get('current_branch_id')
    
    utargets = {}
    ubranches = {}
    utrees = {}

    targets = Target.objects.filter(target=user, read=False)
    for target in targets:
        
        if int(current_branch_id) == int(target.node.branch.id):
            utargets[target.node.id] = 1
        ubranches[target.node.branch.id] = 1
        utrees[target.node.tree.id] = 1
    
    response = {
        'ptype': 'update',
        'utargets': list(utargets.keys()),
        'ubranches': list(ubranches.keys()),
        'utrees': list(utrees.keys()),
    }
    return JsonResponse(response)


funcs['add_tree'] = add_tree
funcs['get_trees'] = get_trees
funcs['get_tree'] = get_tree
funcs['add_branch'] = add_branch
funcs['get_branches'] = get_branches
funcs['get_branch'] = get_branch
funcs['get_nodes'] = get_nodes
funcs['add_node'] = add_node
funcs['get_node'] = get_node
funcs['add_member'] = add_member
funcs['update'] = update


