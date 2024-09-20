from django.urls import path
from . import views

app_name = "api"

urlpatterns = [
    path("bot_thread/", views.BotThreadView.as_view(), name="bot_thread"),
    path(
        "bot_thread/create/",
        views.CreateBotThreadView.as_view(),
        name="create_bot_thread",
    ),
    path(
        "bot_thread/<int:thread_id>/",
        views.BotThreadContentView.as_view(),
        name="messages",
    ),
    path(
        "bot_thread/<int:thread_id>/update/",
        views.UpdateBotThreadContentView.as_view(),
        name="update_bot_thread_content",
    ),
    path(
        'bot_thread/<int:thread_id>/form_content/',
        views.BotThreadFormContentView.as_view(),
        name='bot_thread_form_content'),
    path(
        'bot_thread/<int:id>/update_title/',
        views.UpdateBotThreadTitleView.as_view(),
        name='update_bot_thread_title'),
    path('forms/<int:form_id>/',
         views.FormDetailView.as_view(),
         name='form_by_thread'),
    path('forms/<int:form_id>/update_form/',
        views.UpdateSharedFormView.as_view(), 
        name='update_shared_form'),
    path('forms/create/',
        views.CreateFormView.as_view(),
        name='create_form'),
    path('get_email/',
        views.GetEmailView.as_view(),
        name='get_email'),
]
