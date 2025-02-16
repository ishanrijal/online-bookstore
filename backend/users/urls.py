from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('', views.UserViewSet.as_view({'get': 'list', 'post': 'create'}), name='user-list'),
    path('me/', views.UserViewSet.as_view({'get': 'me'}), name='user-me'),
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] 