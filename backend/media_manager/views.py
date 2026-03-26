from datetime import datetime
from time import sleep
from bs4 import BeautifulSoup
from django.http import JsonResponse
from backendapp.settings import PI_MEDIA_URL
from media_manager.decorators import error_wrapper
from .models import Collection, EpisodeStatus, Language, Media, MediaStatus, Season, Episode, MediaFile, Series
from django.db.models import Count, Case, When, Value, IntegerField, Sum, Q, F
import cv2
import requests


# Alle Kollektionen aufrufen
@error_wrapper
def collections(request):

    collections = Collection.objects.all().annotate(media_count=Count('media')).order_by('id').values('id', 'title', 'media_count')
    return JsonResponse({"collections": list(collections)}, status=200)


# Alle Inhalte einer Kollektion aufrufen
@error_wrapper
def collection_media_list(request, collection_id):

    existing_collection = Collection.objects.filter(id=collection_id)

    if not existing_collection.exists():
        return JsonResponse({}, status=500)
    
    existing_collection = existing_collection.get()
    media_list = Media.objects.filter(collection=existing_collection).order_by('title').annotate(
        season_count=Case(
            When(
                series__isnull=False, then=Count(
                    "series__season",
                    filter=Q(series__season__title__startswith="Staffel"),
                    distinct=True,
                    ),
                ),
            default=Value(0),
            output_field=IntegerField(),
        ),
    ).values(
        'id',
        'series__id',
        'title',
        'cover_image',
        'year_released',
        'rating',
        'folder_path',
        'date_created',
        'season_count',
    )

    return JsonResponse({
        'media_list': list(media_list)
    }, status=200)


# Alle Daten einer Serie aufrufen
@error_wrapper
def series_content(request, media_id):

    series = Media.objects.filter(id=media_id).values('id', 'title', 'description', 'rating', 'cover_image', 'folder_path', 'sub_folder_path', 'date_created', 'year_released').first()
    seasons = Season.objects.filter(series__media__id=media_id).order_by('number').annotate(episode_count=Count('episode')).values('id', 'title', 'number', 'cover_image', 'episode_count')

    genres = Media.objects.get(id=media_id).genres.values_list('name', flat=True).distinct()

    for season in seasons:
        episodes = Episode.objects.all().filter(season__id=season.get('id')).order_by('number').values('id', 'number', 'title', 'is_filler', 'status__title', 'status__code')
        season['episodes'] = list(episodes)
    
    series['genres'] = list(genres)
    series['seasons'] = list(seasons)
    return JsonResponse({"contents": series}, status=200)


# Alle Daten einer Episode aufrufen
@error_wrapper
def episode(request, episode_id):
    
    existing_episode = Episode.objects.filter(id=episode_id)

    if not existing_episode.exists():
        return JsonResponse({}, status=500)
    
    episode = existing_episode.values('id', 'number', 'title', 'is_filler').first()
    files = MediaFile.objects.all().filter(episode__id=episode.get('id')).annotate(language_name=F('language__language'), language_folder_path=F('language__folder_path')).order_by('language').values('id', 'width', 'height', 'duration', 'size', 'fps', 'frame_count', 'file_path', 'language_folder_path', 'language_name')
    
    episode['media_files'] = list(files)
    return JsonResponse({"episode": episode}, status=200)


# Alle Medias aufrufen für Dashboard
@error_wrapper
def media_dashboard(request):

    media_list = Media.objects.order_by('title').select_related('status').filter(series__isnull=False).annotate(
        season_count=Case(
            When(
                series__isnull=False, then=Count(
                    "series__season",
                    filter=Q(series__season__title__startswith="Staffel"),
                    distinct=True,
                    ),
                ),
            default=Value(0),
            output_field=IntegerField(),
        ),
        episode_count=Case(
            When(
                series__isnull=False, then=Count(
                    "series__season__episode",
                    filter=(Q(series__season__title__startswith="Staffel")&Q(series__season__episode__files__isnull=False)),
                    distinct=True,
                    ),
                ),
            default=Value(0),
            output_field=IntegerField(),
        ),
        special_episode_count=Case(
            When(
                series__isnull=False, then=Count(
                    "series__season__episode",
                    filter=(~Q(series__season__title__startswith="Staffel")&Q(series__season__episode__files__isnull=False)),
                    distinct=True,
                    ),
                ),
            default=Value(0),
            output_field=IntegerField(),
        ),
        size=Sum('series__season__episode__files__size'),
    ).values(
        'id',
        'series__id',
        'title',
        'cover_image',
        'year_released',
        'rating',
        'folder_path',
        'date_created',
        'season_count',
        'episode_count',
        'special_episode_count',
        'date_last_synced',
        'tracked',
        'status__code',
        'status__title',
        'size',
    )

    return JsonResponse({
        'media_list': list(media_list)
    }, status=200)


@error_wrapper
def specific_media_episodes(request, media_id):

    print(media_id)

    episode_list = Episode.objects.filter(season__series__media__id=media_id).values('id', 'season__title', 'number', 'title', 'status__code', 'status__title').order_by('season__number', 'number')

    for episode in episode_list:
        languages = MediaFile.objects.filter(episode__id=episode['id']).values_list('language__folder_path', flat=True)
        episode['languages'] = list(languages)

    return JsonResponse({
        'episode_list': list(episode_list)
    }, status=200)


# DB syncen mt Festplatte
def sync_drive(request):

    db_series_list = Series.objects.all().select_related('media').order_by('media__title')
    for db_series in db_series_list:
        media_id = db_series.media.id
        sync_series_func(media_id)

    return JsonResponse({}, status=200)


def sync_series(request, media_id):

    sync_series_func(media_id)

    return JsonResponse({}, status=200)


# DB syncen mt Festplatte
def sync_series_func(media_id):
    db_media = Media.objects.filter(id=media_id).first()
    db_series = Series.objects.filter(media=db_media).first()

    if not db_series:
        return

    print(f"Starte {db_media.title}...")

    db_media.date_last_synced = datetime.today()
    db_media.save()

    r = requests.get(PI_MEDIA_URL)
    
    folders = r.json()
    for folder in folders:
        folder_name = str(folder.get('name'))
        folder_type = folder.get('type')

        if folder_name != db_media.sub_folder_path or folder_type != 'directory':
            continue

        r = requests.get(PI_MEDIA_URL + folder_name + "/" + db_media.folder_path + "/")
        if not r.ok:
            continue

        language_folders = r.json()
        for language_folder in language_folders:
            language_folder_name = str(language_folder.get('name'))
            language_folder_type = language_folder.get('type')

            if language_folder_type != 'directory':
                continue

            db_language = Language.objects.filter(folder_path=language_folder_name).first()

            r = requests.get(PI_MEDIA_URL + folder_name + "/" + db_media.folder_path + "/" + db_language.folder_path + "/")
            if not r.ok:
                continue

            season_folders = r.json()
            for season_folder in season_folders:
                season_folder_name = str(season_folder.get('name'))
                season_folder_type = season_folder.get('type')

                if season_folder_type != 'directory':
                    continue

                db_season = Season.objects.filter(series=db_series, folder_path=season_folder_name).first()
                if not db_season:
                    if season_folder_name.startswith("Staffel"):
                        season_number = season_folder_name[8:]
                    elif season_folder_name.startswith("Alle Filme"):
                        season_number = 0
                    else:
                        season_number = -1

                    db_season = Season.objects.create(
                        series=db_series,
                        folder_path=season_folder_name,
                        title=season_folder_name,
                        number=season_number
                    )
                
                r = requests.get(PI_MEDIA_URL + folder_name + "/" + db_media.folder_path + "/" + db_language.folder_path + "/" + db_season.folder_path + "/")
                if not r.ok:
                    continue

                episode_files = r.json()
                for episode_file in episode_files:
                    episode_file_name = str(episode_file.get('name'))
                    episode_folder_type = episode_file.get('type')
                    episode_size = episode_file.get('size')

                    if episode_folder_type != 'file':
                        continue

                    if episode_file_name.startswith("Folge"):
                        episode_number = episode_file_name[6:10].lstrip('0')
                    elif episode_file_name.startswith("Episode"):
                        episode_number = episode_file_name[8:12].lstrip('0')
                    elif episode_file_name.startswith("Film"):
                        episode_number = episode_file_name[5:9].lstrip('0')

                    if not episode_number:
                        continue

                    db_episode = Episode.objects.filter(season=db_season, number=episode_number).first()

                    if not db_episode:
                        db_episode = Episode.objects.create(
                            season=db_season,
                            number=episode_number
                        )

                    db_media_file = MediaFile.objects.filter(file_path=episode_file_name, language=db_language, episode=db_episode).first()
                    media_file_path = PI_MEDIA_URL + folder_name + "/" + db_media.folder_path + "/" + db_language.folder_path + "/" + db_season.folder_path + "/"  + episode_file_name
                    
                    if not db_media_file: 
                        video = cv2.VideoCapture(media_file_path)

                        print(video.isOpened(), media_file_path)

                        if video.isOpened(): 
                            width  = video.get(cv2.CAP_PROP_FRAME_WIDTH)
                            height = video.get(cv2.CAP_PROP_FRAME_HEIGHT)
                            fps = video.get(cv2.CAP_PROP_FPS)
                            frame_count = video.get(cv2.CAP_PROP_FRAME_COUNT)
                            size_bytes = episode_size
                            size = size_bytes

                            if fps > 0:
                                duration = frame_count / fps
                            else:
                                duration = 0
                        
                        db_media_file = MediaFile.objects.create(
                            language=db_language,
                            episode=db_episode,

                            width=width,
                            height=height,
                            size=size,
                            duration=duration,
                            frame_count=frame_count,
                            fps=fps,

                            file_path=episode_file_name,
                        )
                        print("erstellt")


                    if db_media_file.size != episode_size:
                        video = cv2.VideoCapture(media_file_path)

                        if video.isOpened(): 
                            width  = video.get(cv2.CAP_PROP_FRAME_WIDTH)
                            height = video.get(cv2.CAP_PROP_FRAME_HEIGHT)
                            fps = video.get(cv2.CAP_PROP_FPS)
                            frame_count = video.get(cv2.CAP_PROP_FRAME_COUNT)
                            size_bytes = episode_size
                            size = size_bytes

                            if fps > 0:
                                duration = frame_count / fps
                            else:
                                duration = 0

                        db_media_file.width = width
                        db_media_file.height = height
                        db_media_file.fps = fps
                        db_media_file.frame_count = frame_count
                        db_media_file.duration = duration
                        db_media_file.size = size
                        db_media.save()

                        print("verändert")

    sync_media_status(media_id)


# Status automatisiert ermitteln, dazu wird aniworld aufgerufen und die episoden mit der DB verglichen
def sync_media_status(media_id):

    missing_status = EpisodeStatus.objects.get(code="missing")
    uncomplete_status = EpisodeStatus.objects.get(code="uncompleted")
    complete_status = EpisodeStatus.objects.get(code="completed")

    error = False
    db_series = Series.objects.filter(media__id=media_id).first()

    ANIWORLD_BASE_URL = "https://aniworld.to"
    ANIWORLD_ANIME_BASE_URL = f"{ANIWORLD_BASE_URL}/anime/stream/{db_series.media.folder_path.replace(" ", "-")}"

    print(f"Rufe {db_series.media.title} auf Aniworld auf...")
    resp = requests.get(ANIWORLD_ANIME_BASE_URL)

    html = resp.text
    soup = BeautifulSoup(html, "html.parser")

    season_objs = soup.select('#stream ul:nth-of-type(1) li a')

    for season_obj in season_objs:
        db_season = Season.objects.filter(series=db_series, title=season_obj['title']).first()

        if not db_season:
            
            if str(season_obj['title']).startswith("Staffel"):
                season_number = season_obj.text
            else:
                season_number = 0

            db_season = Season.objects.create(series=db_series, title=season_obj['title'], folder_path=season_obj['title'], number=season_number)

        print(f"Rufe {db_series.media.title} {season_obj['title']} auf Aniworld auf...")
        resp = requests.get(ANIWORLD_BASE_URL + season_obj['href'])

        html = resp.text
        soup = BeautifulSoup(html, "html.parser")

        episode_objs = soup.select('.seasonEpisodesList tbody tr')

        # WENN alle Episoden, die es auf GER DUB gibt bereits in der DB existieren
        # UND
        # WENN alle Episoden, die es NUR auf GER SUB / ENG SUB gibt bereits in der DB existieren
        # DANN
        # Serie als 'completed' markieren
        for episode_obj in episode_objs:

            title_obj = episode_obj.select_one('td:nth-of-type(2) a strong')
            title_alt_obj = episode_obj.select_one('td:nth-of-type(2) a span')

            if title_obj.text:
                title = title_obj.text
            elif title_alt_obj.text:
                title = title_alt_obj.text
            else:
                title = ""

            print(f"Untersuche Folge {episode_obj['data-episode-season-id']}")
            db_episode = Episode.objects.filter(season=db_season, number=episode_obj['data-episode-season-id']).first()

            if not db_episode:
                db_episode = Episode.objects.create(season=db_season, number=episode_obj['data-episode-season-id'], title=title, status=missing_status)
                error = True

            else:
                db_episode.title = title
                db_episode.save()

                episode_language_objs = episode_obj.select_one('td:nth-of-type(4)')
                gerdub_episode_language_obj = episode_language_objs.select('img[title="Deutsch/German"]')
                gersub_episode_language_obj = episode_language_objs.select('img[title="Mit deutschem Untertitel"]')
                engsub_episode_language_obj = episode_language_objs.select('img[title="Englisch"]')

                db_media_files = MediaFile.objects.filter(episode=db_episode)
                db_gerdub_media_file = db_media_files.filter(language__folder_path="GER DUB")
                db_gersub_media_file = db_media_files.filter(language__folder_path="GER SUB")
                db_engsub_media_file = db_media_files.filter(language__folder_path="ENG SUB")

                if len(db_media_files) == 0:
                    error = True
                    db_episode.status = missing_status
                    db_episode.save()
                
                else:
                    if gerdub_episode_language_obj:
                        print("test")
                        if not db_gerdub_media_file:
                            print(f"Episode mit der Nummer {episode_obj['data-episode-season-id']} in {db_season.title} ist nicht auf GER DUB in der DB.")
                            error = True
                            db_episode.status = uncomplete_status
                            db_episode.save()
                        else:
                            db_episode.status = complete_status
                            db_episode.save() 

                    elif gersub_episode_language_obj:
                        if not db_gersub_media_file:
                            print(f"Episode mit der Nummer {episode_obj['data-episode-season-id']} in {db_season.title} ist nicht auf GER SUB in der DB.")
                            error = True
                            db_episode.status = uncomplete_status
                            db_episode.save()
                        else:
                            db_episode.status = complete_status
                            db_episode.save() 
                    
                    elif engsub_episode_language_obj:
                        if not db_engsub_media_file:
                            print(f"Episode mit der Nummer {episode_obj['data-episode-season-id']} in {db_season.title} ist nicht auf ENG SUB in der DB.")
                            error = True
                            db_episode.status = uncomplete_status
                            db_episode.save()
                        else:
                            db_episode.status = complete_status
                            db_episode.save()   

    if error:
        print("Status auf uncompleted gesetzt.")
        db_series.media.status = MediaStatus.objects.get(code="uncompleted")
        db_series.media.save()

    else:
        print("Status auf completed gesetzt.")
        db_series.media.status = MediaStatus.objects.get(code="completed")
        db_series.media.save()
                    





                



