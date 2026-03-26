from django.urls import path

from . import views

urlpatterns = [
    path("collections/", views.collections),
    path("collection_media_list/<int:collection_id>/", views.collection_media_list),
    path("series_content/<int:media_id>/", views.series_content),
    path("episode/<int:episode_id>/", views.episode),
    path("media_dashboard", views.media_dashboard),
    path("specific_media_episodes/<int:media_id>/", views.specific_media_episodes),
    path("sync_drive", views.sync_drive),
    path("sync_series/<int:media_id>/", views.sync_series),
]