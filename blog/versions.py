from djongo import models
from django.utils import timezone

class Version(models.Model):
     title= models.CharField(max_length=100)
     content = models.TextField()
     date = models.DateTimeField(default=timezone.now, verbose_name="Last update")
     modelID=models.IntegerField()
     #objects = models.Manager()