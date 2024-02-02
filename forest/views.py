from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.core.cache import cache

from .models import Tree, Branch, Node, Target

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

    myTrees = {}
    myBranches = {}
    
    inbox = Target.objects.filter(target=request.user)
    for target in inbox:
        myBranches[target.branch.id] = Branch.objects.get(id=target.branch.id)
    
    outbox = Node.objects.filter(sender=request.user)
    for node in outbox:
        myBranches[node.branch.id] = Branch.objects.get(id=node.branch.id)
    
    for tree in myBranches.values():
        myTrees[tree.tree.id] = tree.tree

    context = {
        'trees':myTrees.values(), 
        }

    return render(request, 'forest/home.html', context)


def compose(request):
    if not request.user.is_authenticated:
        return redirect('/')

    if request.method == 'POST':
        topic = request.POST.get('Topic')
        recipients = request.POST.get('Recipients')
        subject = request.POST.get('Subject')
        body = request.POST.get('Body')

        tree = Tree(topic=topic, author=request.user)
        branch = Branch(tree=tree, subject=subject, members=recipients + ', ' + request.user.username)
        node = Node(branch=branch, sender=request.user, content=body)
        tree.save()
        branch.save()
        node.save()
        makeTargets(node, branch)

        return render(request, 'forest/compose.html', {'msg': 'Message sent successfully.'})

    else:
        return render(request, 'forest/compose.html')


'''Helper functions'''

def getUser(username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return None
    return user


def makeTargets(node, branch):
    members = branch.members.split(',')
    members = [member.strip() for member in members]
    members.remove(node.sender.username)

    for member in members:
        target = getUser(member)
        if target is not None:
            target = Target(node=node, target=target, branch=branch)
            target.save()
            cache.delete(f'status_{member}')



'''AJAX functions'''


def get_branches(request):
    tree_id = int(request.POST.get('tree_id'))
    tree = Tree.objects.get(id=tree_id)
    branches = Branch.objects.filter(tree=tree)
    id_list = []
    subject_list = []
    member_list = []
    for branch in branches:
        id_list.append(branch.id)
        subject_list.append(branch.subject)
        member_list.append(branch.members)

    response = {
        'id_list': id_list,
        'subject_list': subject_list,
        'member_list': member_list,
    }
    return JsonResponse(response)


def get_nodes(request):
    branch_id = int(request.POST.get('branch_id'))
    branch = Branch.objects.get(id=branch_id)
    nodes = Node.objects.filter(branch=branch)
    id_list = []
    for node in nodes:
        id_list.append(node.id)

    response = {
        'id_list': id_list,
    }
    return JsonResponse(response)


def get_node(request):
    node_id = int(request.POST.get('node_id'))
    node = Node.objects.get(id=node_id)
    try:
        target = Target.objects.get(node=node, target=request.user)
        target.read = True
        target.save()
        cache.delete(f'status_{request.user.username}')
    except Target.DoesNotExist:
        pass
    response = {
        'content': node.content,
        'sender': node.sender.username,
        'created_on': node.created_on,
        'node_id': node.id,
    }
    return JsonResponse(response)


def quick_reply(request):
    branch_id = int(request.POST.get('branch_id'))
    content = request.POST.get('content')
    
    branch = Branch.objects.get(id=branch_id)
    node = Node(branch=branch, sender=request.user, content=content)
    node.save()
    makeTargets(node, branch)

    response = {
        'status': 'unread_node',
        'branch_id': branch.id,
        'node_id': node.id,
    }
    return JsonResponse(response)


def new_branch(request):
    tree_id = int(request.POST.get('tree_id'))
    subject = request.POST.get('subject')
    members = request.POST.get('members')

    users = members.split(',')
    for user in users:
        user = user.strip()
        if getUser(user) is None:
            response = {
                'status': 'user_not_found',
                'username': user,
            }
            return JsonResponse(response)

    tree = Tree.objects.get(id=tree_id)
    branch = Branch(tree=tree, subject=subject, members=members)
    branch.save()

    response = {
        'status': 'new_branch',
        'branch_id': branch.id,
    }
    return JsonResponse(response)


def update_branch(request):
    user = request.user
    branch_id = int(request.POST.get('branch_id'))
    unread = []
    
    status = cache.get(f'status_{request.user.username}')
    if status is None:
        branch = Branch.objects.get(id=branch_id)
        targets = Target.objects.filter(target=user, branch=branch, read=False)
        for target in targets:
            unread.append(target.node.id)

        response = {
            'branch_id': branch.id,
            'unread': unread,
        }
        cache.set(f'status_{request.user.username}', response, 60*5)
        return JsonResponse(response)
    else:
        return JsonResponse(status)





funcs['get_branches'] = get_branches
funcs['get_nodes'] = get_nodes
funcs['get_node'] = get_node
funcs['quick_reply'] = quick_reply
funcs['new_branch'] = new_branch
funcs['update_branch'] = update_branch