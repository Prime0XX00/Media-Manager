from django.core.management.base import BaseCommand
from media_manager.models import EpisodeStatus, Media, Series, Genre, Season, Episode, Language, MediaFile
from django.db import models

class Command(BaseCommand):
    help = "Setzt den Subfolder aller Medias auf Anime."

    def handle(self, *args, **options):

        episode_list = Episode.objects.all()
        status = EpisodeStatus.objects.get(code='undefined')

        for episode in episode_list:
            episode.status = status
            episode.save()