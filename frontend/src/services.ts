import { runApiQuery } from "./App";
import type { ICollection, IEpisode, IMedia, IMovie, ISeries } from "./types";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const fetchCollections = async () => {
	return await runApiQuery<{ collections: ICollection[] }>(
		fetch(`${VITE_API_URL}/api/media_manager/collections`),
	);
};

export const fetchCollectionMedias = async (collection_id: string) => {
	return await runApiQuery<{ media_list: IMedia[] }>(
		fetch(
			`${VITE_API_URL}/api/media_manager/collection_media_list/${collection_id}`,
		),
	);
};

export const fetchSeriesContent = async (media_id: number) => {
	return await runApiQuery<{ contents: ISeries }>(
		fetch(`${VITE_API_URL}/api/media_manager/series_content/${media_id}`),
	);
};

export const fetchMovieContent = async (media_id: number) => {
	return await runApiQuery<{ contents: IMovie }>(
		fetch(`${VITE_API_URL}/api/media_manager/movie_content/${media_id}`),
	);
};

export const fetchEpisode = async (episode_id: number) => {
	return await runApiQuery<{ episode: IEpisode }>(
		fetch(`${VITE_API_URL}/api/media_manager/episode/${episode_id}`),
	);
};

export const fetchMediaDashboard = async () => {
	return await runApiQuery<{ media_list: IMedia[] }>(
		fetch(`${VITE_API_URL}/api/media_manager/media_dashboard`),
	);
};

export const fetchMediaOverviewEpisodes = async (media_id: number) => {
	return await runApiQuery<{ episode_list: IEpisode[] }>(
		fetch(
			`${VITE_API_URL}/api/media_manager/specific_media_episodes/${media_id}`,
		),
	);
};

export const fetchSyncSeries = async (media_id: number) => {
	await fetch(`${VITE_API_URL}/api/media_manager/sync_series/${media_id}`);
};
