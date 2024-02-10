from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.core.cache import cache

from .models import Node, Target

funcs = {}

# Create your views here.
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
    user = request.POST.get('user')
    name = request.POST.get('username')

    inbox = {}
    targets = Target.objects.filter(user=User.objects.get(username=user))
    for target in targets:
        node = target.node
        author = node.author.username
        if author == name:
            inbox[author] = 1

    response = {
        'action':'name_clicked',
        'nodes': list(inbox.keys()),
    }
    return JsonResponse(response)


funcs['name_clicked'] = name_clicked

