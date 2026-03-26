from django.http import JsonResponse


def error_wrapper(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            return JsonResponse({"message": "[BACKEND FEHLER] " + str(e)}, status=500)
    
    return wrapper