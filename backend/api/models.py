from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class BotThread(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class BotThreadContent(models.Model):
    thread = models.OneToOneField(
        BotThread, related_name="bot_content", on_delete=models.CASCADE
    )
    chat_content = models.JSONField(default=list)
    form_content = models.JSONField(null=True)

    def __str__(self):
        return f"Content for thread: {self.thread.title}"

class Forms(models.Model):
    bot_thread = models.ForeignKey(BotThread, on_delete=models.CASCADE, related_name='forms')
    form_title = models.CharField(max_length=255, blank=True)
    shared_form = models.JSONField(default=dict)

    def save(self, *args, **kwargs):
        if self.bot_thread:
            self.form_title = self.bot_thread.title
        super().save(*args, **kwargs)

    def __str__(self):
        return self.form_title
