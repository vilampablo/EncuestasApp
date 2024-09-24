from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import BotThread, BotThreadContent, Forms, CustomUser, FormResponses, FormAnswers, FormAnalytics
from .serializers import BotThreadSerializer, BotThreadContentSerializer, FormsSerializer, CustomUserSerializer, FormResponsesSerializer, FormAnswersSerializer, FormAnalyticsSerializer
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.views import APIView

# Create your views here.

class UserCreateView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]

class GetEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = self.request.user
        return Response({"email": user.email})

class BotThreadView(generics.ListAPIView):
    queryset = BotThread.objects.all()
    serializer_class = BotThreadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return BotThread.objects.filter(author=user)


class BotThreadContentView(generics.RetrieveAPIView):
    serializer_class = BotThreadContentSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "thread_id"

    def get_object(self):
        thread_id = self.kwargs.get("thread_id")
        return BotThreadContent.objects.get(thread_id=thread_id)


class CreateBotThreadView(generics.CreateAPIView):
    queryset = BotThread.objects.all()
    serializer_class = BotThreadSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        bot_thread = serializer.save(author=self.request.user)
        # Create associated BotThreadContent
        BotThreadContent.objects.create(thread=bot_thread, chat_content={})


class UpdateBotThreadContentView(generics.UpdateAPIView):
    queryset = BotThreadContent.objects.all()
    serializer_class = BotThreadContentSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "thread_id"

    def get_object(self):
        thread_id = self.kwargs.get("thread_id")
        try:
            return BotThreadContent.objects.get(thread_id=thread_id)
        except BotThreadContent.DoesNotExist:
            bot_thread = BotThread.objects.get(id=thread_id)
            return BotThreadContent.objects.create(thread=bot_thread, chat_content=[])

    def update(self, request, *args, **kwargs):
        bot_thread_content = self.get_object()
        new_message = request.data.get("chat_content")

        if not isinstance(new_message, dict):
            return Response(
                {"error": "chat_content should be a dictionary"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Ensure the message has both 'message' and 'isUser' fields
        if "message" not in new_message or "isUser" not in new_message:
            return Response(
                {"error": "chat_content must include 'message' and 'isUser' fields"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Ensure chat_content is a list before appending
        if not isinstance(bot_thread_content.chat_content, list):
            bot_thread_content.chat_content = []
        
        # Append the new message (which is a dict)
        bot_thread_content.chat_content.append(new_message)
        
        # Save the updated BotThreadContent
        bot_thread_content.save()

        # Update the last_updated field of the associated BotThread
        bot_thread_content.thread.save(update_fields=["last_updated"])

        serializer = self.get_serializer(bot_thread_content)
        return Response(serializer.data)

class BotThreadFormContentView(generics.RetrieveUpdateAPIView):
    queryset = BotThreadContent.objects.all()
    serializer_class = BotThreadContentSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "thread_id"

    def get_object(self):
        thread_id = self.kwargs.get("thread_id")
        try:
            return BotThreadContent.objects.get(thread_id=thread_id)
        except BotThreadContent.DoesNotExist:
            bot_thread = BotThread.objects.get(id=thread_id)
            return BotThreadContent.objects.create(thread=bot_thread, chat_content=[], form_content={})

    def retrieve(self, request, *args, **kwargs):
        bot_thread_content = self.get_object()
        return Response({"form_content": bot_thread_content.form_content})

    def update(self, request, *args, **kwargs):
        bot_thread_content = self.get_object()
        new_form_content = request.data.get("form_content")

        # Validate form_content
        if not isinstance(new_form_content, dict):
            return Response(
                {"error": "form_content should be a dictionary"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update the form_content field
        bot_thread_content.form_content = new_form_content
        bot_thread_content.save()

        return Response({"form_content": bot_thread_content.form_content})

class UpdateBotThreadTitleView(generics.RetrieveUpdateAPIView):
    queryset = BotThread.objects.all()
    serializer_class = BotThreadSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"  # Look up the BotThread by its ID

    def update(self, request, *args, **kwargs):
        bot_thread = self.get_object()  # Get the BotThread instance
        new_title = request.data.get("title")  # Get the new title from the request

        if not new_title:
            return Response(
                {"error": "Title is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update the title in BotThread
        bot_thread.title = new_title
        bot_thread.save()

        # Update the title inside the form_content in BotThreadContent
        try:
            bot_thread_content = BotThreadContent.objects.get(thread=bot_thread)
            if bot_thread_content.form_content and isinstance(bot_thread_content.form_content, dict):
                bot_thread_content.form_content['title'] = new_title
                bot_thread_content.save()  # Save the updated form_content
        except BotThreadContent.DoesNotExist:
            return Response(
                {"error": "BotThreadContent does not exist."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({
            "bot_thread_title": bot_thread.title,
            "form_content_title": bot_thread_content.form_content.get('title')
        })

class FormDetailView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, form_id):
        try:
            # Get the form using its primary key (form_id)
            form = Forms.objects.get(id=form_id)
            serializer = FormsSerializer(form)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Forms.DoesNotExist:
            return Response({'error': 'Form not found'}, status=status.HTTP_404_NOT_FOUND)

class UpdateSharedFormView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request, form_id):
        try:
            form = Forms.objects.get(id=form_id)
            data = request.data
            form.shared_form = data.get('shared_form', form.shared_form)
            form.save()
            serializer = FormsSerializer(form)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Forms.DoesNotExist:
            return Response({'error': 'Form not found'}, status=status.HTTP_404_NOT_FOUND)

class CreateFormView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        bot_thread_id = data.get('bot_thread')

        # Check if bot_thread_id exists in the request
        if not bot_thread_id:
            return Response(
                {"error": "bot_thread_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if a form with the same bot_thread_id already exists
        existing_form = Forms.objects.filter(bot_thread_id=bot_thread_id).first()
        if existing_form:
            return Response(
                {
                    "error": f"A form with bot_thread_id {bot_thread_id} already exists.",
                    "id": existing_form.id  # Return the existing form's ID
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Proceed with the form creation if no conflict
        serializer = FormsSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FormResponsesViewSet(viewsets.ModelViewSet):
    serializer_class = FormResponsesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return form responses that belong to the logged-in user
        return FormResponses.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically associate the user with the form response
        serializer.save(user=self.request.user)

class FormAnswersViewSet(viewsets.ModelViewSet):
    queryset = FormAnswers.objects.all()
    serializer_class = FormAnswersSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        form_response_id = request.data.get('form_response')
        form_reference = request.data.get('form_reference')  # Ensure you get the form reference if needed
        answers_data = request.data.get('answers')

        # Step 1: Create the FormResponse if it doesn't exist
        if not form_response_id:
            form_response = FormResponses.objects.create(
                form_id=form_reference,  # You should ensure that the correct form ID is passed here
                user=request.user
            )
            form_response_id = form_response.id
        else:
            form_response = FormResponses.objects.get(id=form_response_id)

        # Step 2: Save all answers
        for answer_data in answers_data:
            FormAnswers.objects.create(
                form_response=form_response,
                question=answer_data['question'],
                answer=answer_data['answer']
            )

        # Return a response indicating success
        return Response({"message": "Form answers submitted successfully"}, status=status.HTTP_201_CREATED)

    def retrieve(self, request, *args, **kwargs):
        form_response_id = kwargs.get('pk')  # Get the form_response_id from the URL

        # Filter answers by form_response_id
        answers = FormAnswers.objects.filter(form_response_id=form_response_id)

        # Serialize the answers
        serializer = self.get_serializer(answers, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

class FormAnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FormAnalyticsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return analytics related to forms the user owns or has access to
        # Adjust logic if you need a more complex permissions model
        return FormAnalytics.objects.filter(form__owner=self.request.user)
