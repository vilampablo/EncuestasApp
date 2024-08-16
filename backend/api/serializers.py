from django.contrib.auth.models import User
from rest_framework import serializers
from .models import BotThread, UserThread

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password", "email"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class BotThreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = BotThread
        fields = ['id', 'author', 'title', 'chat_content', 'questions', 'last_updated']
        extra_kwargs = {"author": {"read_only": True}}

class UserThreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserThread
        fields = ['id', 'author', 'reipient_name', 'reciepient_last_name', 'recipient_email', 'title', 'chat_content', 'questions', 'last_updated']
        extra_kwargs = {"author": {"read_only": True}}