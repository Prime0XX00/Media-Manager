from django.contrib import admin
from .models import (
    Collection, EpisodeStatus, Genre, Media, Movie, Series,
    Season, Episode, Language, MediaFile, MediaStatus
)


# =========================
# INLINE MODELS
# =========================
class MovieInline(admin.StackedInline):
    model = Movie
    extra = 0
    can_delete = False


class SeriesInline(admin.StackedInline):
    model = Series
    extra = 0
    can_delete = False


class SeasonInline(admin.TabularInline):
    model = Season
    extra = 0


class EpisodeInline(admin.TabularInline):
    model = Episode
    extra = 0


class MediaFileInline(admin.TabularInline):
    model = MediaFile
    raw_id_fields = ["movie", "episode", "language"]
    extra = 0
    autocomplete_fields = ["language"]


# =========================
# MEDIA ADMIN
# =========================


@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "year_released", "rating", "type_display", "status")
    search_fields = ("title", "description")
    list_filter = ("year_released", "genres")
    filter_horizontal = ("genres",)

    inlines = [MovieInline, SeriesInline]

    def type_display(self, obj):
        if hasattr(obj, "movie"):
            return "🎬 Film"
        if hasattr(obj, "series"):
            return "📺 Serie"
        return "❓ Unbekannt"

    type_display.short_description = "Typ"


# =========================
# SERIES ADMIN
# =========================

@admin.register(Series)
class SeriesAdmin(admin.ModelAdmin):
    list_display = ("media",)
    search_fields = ("media__title",)
    inlines = [SeasonInline]


# =========================
# SEASON ADMIN
# =========================

@admin.register(Season)
class SeasonAdmin(admin.ModelAdmin):
    list_display = ("title", "series", "number")
    list_filter = ("series",)
    search_fields = ("title", "series__media__title")
    inlines = [EpisodeInline]


# =========================
# EPISODE ADMIN
# =========================

@admin.register(Episode)
class EpisodeAdmin(admin.ModelAdmin):
    list_display = ("title", "season", "number", "is_filler", "status")
    list_filter = ("season", "is_filler")
    search_fields = ("title", "season__series__media__title")
    inlines = [MediaFileInline]


# =========================
# MOVIE ADMIN
# =========================

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ("media",)
    search_fields = ("media__title",)
    inlines = [MediaFileInline]


# =========================
# MEDIA FILE ADMIN
# =========================

@admin.register(MediaFile)
class MediaFileAdmin(admin.ModelAdmin):
    list_display = (
        "file_path",
        "language",
        "get_target",
        "width",
        "height",
        "duration",
        "container",
    )
    list_filter = ("language", "container", "codec_video", "codec_audio")
    search_fields = ("file_path", "movie__media__title", "episode__season__series__media__title")
    autocomplete_fields = ("movie", "episode", "language")

    def get_target(self, obj):
        if obj.movie:
            return f"🎬 {obj.movie.media.title}"
        if obj.episode:
            return f"📺 {obj.episode.season.series.media.title} - E{obj.episode.number}"
        return "-"

    get_target.short_description = "Media"


# =========================
# SIMPLE MODELS
# =========================

@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ("title",)
    filter_horizontal = ("media",)
    search_fields = ("title",)


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)

@admin.register(MediaStatus)
class MediaStatusAdmin(admin.ModelAdmin):
    list_display = ("title", "code")
    search_fields = ("title", "code")

@admin.register(EpisodeStatus)
class EpisodeStatusAdmin(admin.ModelAdmin):
    list_display = ("title", "code")
    search_fields = ("title", "code")


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ("language", "folder_path")
    search_fields = ("language",)
