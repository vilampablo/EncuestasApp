from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class BotThread(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bot_threads')

    title = models.CharField(max_length=100)
    chat_content = models.JSONField()
    questions = models.JSONField()

    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class UserThread(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_chat_threads')

    bot_thread = models.ForeignKey(BotThread, on_delete=models.CASCADE, related_name='user_chat_threads')

    reipient_name = models.CharField(max_length=100)
    reciepient_last_name = models.CharField(max_length=100)
    recipient_email = models.EmailField()

    chat_content = models.JSONField()
    questions = models.JSONField()

    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.create_bot_chat_thread.title} - {self.id}"