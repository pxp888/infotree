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


class Branch(models.Model):
    id = models.AutoField(primary_key=True)
    tree = models.ForeignKey(Tree, on_delete=models.CASCADE, related_name='branches')
    created_on = models.DateTimeField(auto_now_add=True)
    subject = models.CharField(max_length=200)

    class Meta:
        ordering = ['-created_on']

    def __str__(self):
        return self.tree.topic + ' - ' + self.subject


class Member(models.Model):
    id = models.AutoField(primary_key=True)
    tree = models.ForeignKey(Tree, on_delete=models.CASCADE, related_name='members')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.tree.topic + ' - ' + self.branch.subject + ' - ' + self.user.username


class Node(models.Model):
    id = models.AutoField(primary_key=True)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='nodes')
    tree = models.ForeignKey(Tree, on_delete=models.CASCADE, related_name='nodes')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(null=True, blank=True)
    created_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_on']

    def __str__(self):
        return self.branch.subject + ' - ' + self.sender.username + ' - ' + str(self.created_on)


class Target(models.Model):
    id = models.AutoField(primary_key=True)
    node = models.ForeignKey(Node, on_delete=models.CASCADE, related_name='targets')
    target = models.ForeignKey(User, on_delete=models.CASCADE, related_name='targets')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='targets')
    tree = models.ForeignKey(Tree, on_delete=models.CASCADE, related_name='targets')
    notified = models.BooleanField(default=False)
    read = models.BooleanField(default=False)

    def __str__(self):
        return self.target.username + ' - ' + str(self.node.id)

