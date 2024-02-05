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

