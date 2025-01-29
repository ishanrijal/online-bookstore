from rest_framework import permissions

class IsAdminOrPublisher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and (request.user.is_staff or request.user.role == 'Publisher')

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user

class IsVerifiedUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_email_verified 