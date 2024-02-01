from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.core.cache import cache

from .models import Tree, Branch, Node, Target


# Create your views here.
def homepage(request):
    if not request.user.is_authenticated:
        return render(request, 'forest/landing.html')
    
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

    # unread = Branch.objects.filter(target__target=request.user, target__read=False)
    # print(unread)

    context = {
        'branches':myBranches.values(), 
        'trees':myTrees.values(), 
        }

    return render(request, 'forest/home.html', context)


def branchview(request, id):
    if not request.user.is_authenticated:
        return render(request, 'forest/landing.html')
    
    if request.method == 'POST':
        if request.POST.get('type')=='quickreply':
            content = request.POST.get('Body')
            branch = get_object_or_404(Branch, id=id)
            node = Node(branch=branch, sender=request.user, content=content)
            node.save()
            makeTargets(node, branch)
            return redirect('branchview', id=id)

    if request.POST.get('type')=='update':
        status = cache.get(f'status_{request.user.username}')

        if status is None:
            status = True
            try:
                branch = get_object_or_404(Branch, id=id)
                targets = Target.objects.filter(target=request.user, branch=branch, read=False)
            except Target.DoesNotExist:
                status = False
            if len(targets) == 0:
                status = False
            cache.set(f'status_{request.user.username}', status, 60*5)

        response = {
            'status': status,
        }
        return JsonResponse(response)


    branch = get_object_or_404(Branch, id=id)
    tree = branch.tree
    nodes = Node.objects.filter(branch=branch)
                
    targets = Target.objects.filter(target=request.user, branch=branch)
    for target in targets:
        target.read = True
        target.save()

    context = {
        'tree': tree,
        'branch': branch,
        'nodes': nodes,
    }
    cache.delete(f'status_{request.user.username}')
    return render(request, 'forest/branchview.html', context)


def compose(request):
    if not request.user.is_authenticated:
        return render(request, 'forest/landing.html')

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

