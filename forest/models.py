from django.db import models
from django.contrib.auth.models import User


# Create your models here.

class Tree(models.Model):
    id = models.AutoField(primary_key=True)
    topic = models.CharField(max_length=200)
    created_on = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        ordering = ['-created_on']

    def __str__(self):
        return self.topic


class Node(models.Model):
    id = models.AutoField(primary_key=True)
    tree = models.ForeignKey(Tree, on_delete=models.CASCADE, related_name='nodes')
    base = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    subject = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_on']

    def __str__(self):
        return self.subject


class targets(models.Model):
    id = models.AutoField(primary_key=True)
    basenode = models.ForeignKey(Node, on_delete=models.CASCADE, related_name='basetargets')
    target = models.ForeignKey(User, on_delete=models.CASCADE, related_name='targets')
    notified = models.BooleanField(default=False)
    read = models.BooleanField(default=False)

    def __str__(self):
        return self.target.username + ' - ' + self.basenode.subject


