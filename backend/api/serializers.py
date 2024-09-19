from django.contrib.auth.models import User
from rest_framework import serializers
from .models import BotThread, BotThreadContent, Forms, UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["email", "first_name", "last_name"]
        extra_kwargs = {
            'email': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ["id", "username", "password", "profile"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', None)
        user = User.objects.create_user(**validated_data)
        
        if profile_data:
            UserProfile.objects.create(user=user, **profile_data)
        
        return user

class BotThreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = BotThread
        fields = ["id", "author", "title", "last_updated"]
        extra_kwargs = {"author": {"read_only": True}}

class BotThreadContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BotThreadContent
        fields = ["id", "thread", "chat_content", "form_content"]

    def update(self, instance, validated_data):
        # Update chat_content
        new_chat_content = validated_data.get("chat_content", None)
        if new_chat_content:
            if isinstance(new_chat_content, list):
                instance.chat_content.extend(new_chat_content)
            else:
                raise serializers.ValidationError("chat_content must be a list.")
        
        # Update form_content if provided
        new_form_content = validated_data.get("form_content", None)
        if new_form_content:
            instance.form_content = new_form_content

        instance.save()
        return instance

class FormsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forms
        fields = ['id', 'bot_thread', 'form_title', 'shared_form']