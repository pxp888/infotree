from django.contrib import admin
from .models import Tree, Branch, Node, Target

# Register your models here.
admin.site.register(Tree)
admin.site.register(Branch)
admin.site.register(Node)
admin.site.register(Target)
