from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(_('email address'), unique=True)
    username = models.CharField(max_length=150, blank=True, null=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

class BotThread(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
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
