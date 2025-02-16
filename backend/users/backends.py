from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class EmailOrUsernameModelBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            logger.debug(f"Attempting authentication for username: {username}")
            user = User.objects.get(Q(username=username) | Q(email=username))
            logger.debug(f"Found user: {user.username}")
            
            if user.check_password(password):
                logger.debug("Password check successful")
                return user
            logger.debug("Password check failed")
            return None
        except User.DoesNotExist:
            logger.debug("No user found")
            return None 