from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db.models import Q, CheckConstraint

from backendapp.storage import PiStorage


class Collection(models.Model):
    title = models.CharField(max_length=100)
    media = models.ManyToManyField("Media", blank=True, related_name="collection")

    def __str__(self):
        return self.title   

    class Meta:
        managed = True


class Genre(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name
    
    class Meta:
        managed = True
    

class Media(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    cover_image = models.ImageField(upload_to="public/anime/covers/", storage=PiStorage(), null=True, blank=True)
    year_released = models.IntegerField(null=True, blank=True)
    genres = models.ManyToManyField(Genre, blank=True)
    rating = models.PositiveIntegerField(validators=[
        MaxValueValidator(10),
        MinValueValidator(0)
    ], blank=True, null=True)
    folder_path = models.CharField(max_length=1024, null=True, blank=True)
    sub_folder_path = models.CharField(max_length=1024, null=True, blank=True)
    date_created = models.DateField(null=True, blank=True)
    date_last_synced = models.DateField(null=True, blank=True)
    tracked = models.BooleanField(null=True, blank=True)
    status = models.ForeignKey("MediaStatus", on_delete=models.CASCADE, blank=True, null=True, related_name="media")

    def __str__(self):
        return self.title
    
    class Meta:
        managed = True


class MediaStatus(models.Model):
    title = models.CharField(max_length=100)
    code = models.CharField(max_length=100)

    def __str__(self):
        return self.title
     
    class Meta:
        managed = True


class Movie(models.Model):
    media = models.OneToOneField(Media, on_delete=models.CASCADE, related_name="movie")

    def __str__(self):
        return self.media.title + " " + str(self.media.year_released)


class Series(models.Model):
    media = models.OneToOneField(Media, on_delete=models.CASCADE, related_name="series")

    def __str__(self):
        return self.media.title + " " + str(self.media.year_released)


class Season(models.Model):
    series = models.ForeignKey(Series, models.CASCADE, related_name="season")
    title = models.CharField(max_length=200)
    number = models.PositiveIntegerField()
    cover_image = models.ImageField(upload_to="public/season/covers/", storage=PiStorage(), null=True, blank=True)
    folder_path = models.CharField(max_length=1024, null=True, blank=True)

    def __str__(self):
        return self.series.media.title + " - " + self.title
    
    class Meta:
        managed = True


class Episode(models.Model):
    season = models.ForeignKey(Season, models.CASCADE, related_name="episode")
    number = models.PositiveIntegerField()
    title = models.CharField(max_length=200, null=True, blank=True)
    is_filler = models.BooleanField(default=False, null=True, blank=True)
    status = models.ForeignKey("EpisodeStatus", on_delete=models.CASCADE, blank=True, null=True, related_name="episode")

    def __str__(self):
        return  self.season.series.media.title + " " + self.season.title + " " +  str(self.number)
    
    class Meta:
        managed = True


class EpisodeStatus(models.Model):
    title = models.CharField(max_length=100)
    code = models.CharField(max_length=100)

    def __str__(self):
        return self.title
     
    class Meta:
        managed = True


class Language(models.Model):
    language = models.CharField(max_length=200)
    folder_path = models.CharField(max_length=1024, null=True, blank=True)

    def __str__(self):
        return self.language
    
    class Meta:
        managed = True


class MediaFile(models.Model):
    language = models.ForeignKey(Language, models.CASCADE, related_name="media_files")

    # Beziehung: entweder Episode ODER Movie
    episode = models.ForeignKey(Episode, models.CASCADE, null=True, blank=True, related_name="files")
    movie = models.ForeignKey(Movie, models.CASCADE, null=True, blank=True, related_name="files")

    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    size = models.BigIntegerField(null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True)
    frame_count = models.IntegerField(null=True, blank=True)
    fps = models.FloatField(null=True, blank=True)

    codec_video = models.CharField(max_length=50, null=True, blank=True)
    codec_audio = models.CharField(max_length=50, null=True, blank=True)
    container = models.CharField(max_length=20, null=True, blank=True)  # mkv, mp4, avi etc.

    file_path = models.CharField(max_length=1024, null=True, blank=True)

    def __str__(self):
        target = self.movie.media.title if self.movie else f"{self.episode.season.series.media.title} S{self.episode.season.number} E{self.episode.number}"
        return f"{target} - {self.language.language}"
    
    class Meta:
        constraints = [
            CheckConstraint(
                condition=(
                    Q(movie__isnull=False, episode__isnull=True) |
                    Q(movie__isnull=True, episode__isnull=False)
                ),
                name="mediafile_movie_xor_episode"
            )
        ]

