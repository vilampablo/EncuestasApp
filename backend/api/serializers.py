from django.contrib.auth.models import User
from rest_framework import serializers
from .models import BotThread, BotThreadContent, Forms, CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = CustomUser(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
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