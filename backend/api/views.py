from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import BotThread, UserThread
from .serializers import BotThreadSerializer, UserThreadSerializer

# Create your views here.

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class BotThreadView(generics.ListAPIView):
    queryset = BotThread.objects.all()
    serializer_class = BotThreadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return BotThread.objects.filter(author=user)

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class CreateBotThreadView(generics.CreateAPIView):
    queryset = BotThread.objects.all()
    serializer_class = BotThreadSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)
    

class UserThreadView(generics.ListAPIView):
    queryset = UserThread.objects.all()
    serializer_class = UserThreadSerializer
