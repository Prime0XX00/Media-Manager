from django.core.management.base import BaseCommand
from media_manager.models import Media, Series, OldSeries, Genre, OldGenre, Season, OldSeason, Episode, OldEpisode, Language, OldLanguage, MediaFile, OldLanguageEpisode
from django.db import models

class Command(BaseCommand):
    help = "Importiert die bestehenden Daten der alten DB in die neue."

    def handle(self, *args, **options):

        #Media.objects.all().delete()

        # Genres importieren
        old_genre_list = OldGenre.objects.using('old').all().values_list('name', flat=True)

        for old_genre in old_genre_list:
            existing_genre = Genre.objects.filter(name=old_genre)

            if not existing_genre.exists():
                Genre.objects.create(name=old_genre)

                print(f"{old_genre} importiert.")

        
        # Sprachen importieren
        old_language_list = OldLanguage.objects.using('old').all().values_list('language', flat=True)

        for old_language in old_language_list:
            existing_language = Language.objects.filter(language=old_language)

            if not existing_language.exists():
                Language.objects.create(language=old_language)

                print(f"{old_language} importiert.")
            
        # Serien importieren
        old_series_list = OldSeries.objects.using('old').all()
        for old_series in old_series_list:

            # Wenn Serie noch nicht importiert dann neu anlegen
            # Egal, ob die Serie bereits existierte oder neu ist, werden die Staffeln geloopt
            media = Media.objects.filter(title=old_series.title, folder_path=old_series.folder_path).select_related('series', 'movie').first()
            if not media:
                
                media = Media.objects.create(
                    title=old_series.title,
                    description=old_series.description,
                    cover_image=old_series.cover_image,
                    year_released=old_series.year_released,
                    rating=old_series.rating,
                    folder_path=old_series.folder_path,
                    date_created=old_series.date_created,
                )
                
                for genre in old_series.genres.all():
                    new_genre, created = Genre.objects.get_or_create(name=genre.name)
                    media.genres.add(new_genre)

                media.save()
                
                series = Series.objects.create(
                    media=media
                )

                print(f"{media.title} importiert.")
            
            else:
                series = Series.objects.filter(media=media).first()
                print(f"{media.title} bereits importiert.")

            # Staffeln importieren
            old_season_list = OldSeason.objects.using('old').filter(series=old_series)
            for old_season in old_season_list:

                # Wenn Staffel noch nicht importiert dann neu anlegen
                # Egal, ob die Staffel bereits existierte oder neu ist, werden die Episoden geloopt
                season = Season.objects.filter(title=old_season.title, series=series).first()
                if not season:

                    season = Season.objects.create(
                        series=series,
                        title=old_season.title,
                        number=old_season.number,
                        cover_image=old_season.cover_image,
                        folder_path=old_season.folder_path
                    )
                    print(f"{season.title} importiert.")
                
                else:
                    print(f"{season.title} bereits importiert.")
                
                # Episdoen importieren
                old_episode_list = OldEpisode.objects.using('old').filter(season=old_season)
                for old_episode in old_episode_list:

                    # Wenn Episode noch nicht importiert dann neu anlegen
                    # Egal, ob die Episode bereits existierte oder neu ist, werden die Sprachen geloopt
                    episode = Episode.objects.filter(title=old_episode.title, number=old_episode.number, season=season).first()
                    if not episode:

                        episode = Episode.objects.create(
                            season=season,
                            title=old_episode.title,
                            number=old_episode.number,
                            is_filler=old_episode.is_filler,
                        )
                        print(f"Folge {episode.number} importiert.")
                    
                    else:
                        print(f"{season.title} bereits importiert.")

                    # Sprachen importieren
                    old_language_episode_list = OldLanguageEpisode.objects.using('old').filter(episode=old_episode)
                    for old_language_episode in old_language_episode_list:

                        media_file = MediaFile.objects.filter(language__language=old_language_episode.language.language, episode=episode).first()
                        if not media_file:
                            
                            language = Language.objects.filter(language=old_language_episode.language.language).first()

                            media_file = MediaFile.objects.create(
                                language=language,
                                episode=episode,
                                width=old_language_episode.width,
                                height=old_language_episode.height,
                                size=old_language_episode.size,
                                duration=old_language_episode.duration,
                                frame_count=old_language_episode.frame_count,
                                fps=old_language_episode.fps,
                                file_path=old_language_episode.file_path,
                            )
                            print(f"Folge {episode.number} [{old_language_episode.language.language}] importiert.")
                        
                        else:
                            print(f"Folge {episode.number} [{old_language_episode.language.language}] breits importiert.")