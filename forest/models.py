from django.db import models
from django.contrib.auth.models import User


# Create your models here.


class Node(models.Model):
    id = models.AutoField(primary_key=True)
    path = models.TextField()
    base = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    created_on = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(null=True, blank=True)
    folder = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_on']

    def __str__(self):
        if self.folder:
            return 'folder : ' + str(self.id) + ' - ' + str(self.path)
        else:
            return 'node : ' + str(self.id) + ' - ' + str(self.path)


class Target(models.Model):
    id = models.AutoField(primary_key=True)
    node = models.ForeignKey(Node, on_delete=models.CASCADE, related_name='targets')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='targets')
    read = models.BooleanField(default=False)

    def __str__(self):
        return 'path : ' + self.user.username + '/' + str(self.node.path) + '/' + str(self.node.id)


