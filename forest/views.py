from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from .models import Tree, Branch, Node, Target


# Create your views here.
def homepage(request):
    if not request.user.is_authenticated:
        return render(request, 'forest/landing.html')
    
    myTrees = {}
    myBranches = {}
    myNodes = []

    outbox = Node.objects.filter(sender=request.user)
    for node in outbox:
        myBranches[node.branch.id] = node.branch

    inbox = Target.objects.filter(target=request.user)
    for target in inbox:
        myNodes.append(target.node)

    for node in myNodes:
        myBranches[node.branch.id] = node.branch
    
    for branch in myBranches.values():
        myTrees[branch.tree.id] = branch.tree

    return render(request, 'forest/home.html', {'branches': myBranches.values(), 'trees': myTrees.values()})


def branchview(request, id):
    if not request.user.is_authenticated:
        return render(request, 'forest/landing.html')

    if request.method == 'POST':
        recipients = request.POST.get('Recipient')
        recipients = recipients.split(',')
        recipients = [x.strip() for x in recipients]
        getters = []
        for recipient in recipients:
            user = getUser(recipient)
            if user is None:
                return render(request, 'forest/compose.html', {'msg': 'User ' + recipient + ' does not exist'})
            else:
                getters.append(user)
        
        subject = request.POST.get('Subject')
        ParentBranch = request.POST.get('ParentBranch')
        body = request.POST.get('Body')
        ParentNode = request.POST.get('ParentNode')
        print('ParentNode', ParentNode)

        sender = getUser(request.user.username)
        branch = Branch.objects.get(pk=ParentBranch)
        tree = branch.tree
        node = Node(content=body, sender=sender, branch=branch)
        node.save()
        for getter in getters:
            target = Target(node=node, target=getter)
            target.save()


    try:
        branch = Branch.objects.get(pk=id)
    except Branch.DoesNotExist:
        return render(request, 'forest/branchview.html', {'msg': 'Branch does not exist'})
    
    
    nodes = Node.objects.filter(branch=branch)
    
    return render(request, 'forest/branchview.html', {'branch': branch, 'nodes': nodes})


def compose(request):
    if not request.user.is_authenticated:
        return render(request, 'forest/landing.html')
    if request.method == 'POST':
        recipients = request.POST.get('Recipient')
        subject = request.POST.get('Subject')
        topic = request.POST.get('Topic')
        body = request.POST.get('Body')

        recipients = recipients.split(',')
        recipients = [x.strip() for x in recipients]
        getters = []
        for recipient in recipients:
            user = getUser(recipient)
            if user is None:
                return render(request, 'forest/compose.html', {'msg': 'User ' + recipient + ' does not exist'})
            else:
                getters.append(user)
        
        sender = getUser(request.user.username)
        tree = Tree(topic=topic, author=sender)
        branch = Branch(subject=subject, tree=tree)
        node = Node(content=body, sender=sender, branch=branch)
        tree.save()
        branch.save()
        node.save()
        for getter in getters:
            target = Target(node=node, target=getter)
            target.save()

        return render(request, 'forest/compose.html', {'msg': 'Message sent'})
    else:
        return render(request, 'forest/compose.html')


def getUser(username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return None
    return user

