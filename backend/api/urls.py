from django.urls import path
from . import views

app_name = "api"

urlpatterns = [
    path("bot_thread/", views.BotThreadView.as_view(), name="bot_thread"),
    path("bot_thread/create/", views.CreateBotThreadView.as_view(), name="create_bot_thread"),
]