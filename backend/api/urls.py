from django.urls import path
from . import views
from .views import FormResponsesViewSet, FormAnswersViewSet, FormAnalyticsViewSet

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

        
    path('form-responses/', 
         FormResponsesViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='form_responses'),
    path('form-responses/<int:pk>/', 
         FormResponsesViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), 
         name='form_response'),
    
    path('form-answers/', 
         FormAnswersViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='form_answers'),
    path('form-answers/<int:pk>/', 
         FormAnswersViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), 
         name='form_answer'),

    path('form-analytics/', 
         FormAnalyticsViewSet.as_view({'get': 'list'}), 
         name='form_analytics'),
    path('form-analytics/<int:pk>/', 
         FormAnalyticsViewSet.as_view({'get': 'retrieve'}), 
         name='form_analytics_by_form'),
]