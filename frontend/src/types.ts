export interface ApiError extends Error {
	status: number;
	body: any;
}

export type ICollection = {
	id: number;
	title: string;
	media_count: number;
};

export type IMedia = {
	id: number;
	series__id: number | null;
	title: string;
	cover_image: string;
	year_released: number;
	rating: number;
	folder_path: string;
	date_created: Date;
	season_count: number;
	episode_count?: number;
	special_episode_count?: number;
	date_last_synced?: Date;
	tracked?: boolean;
	status__title?: string;
	status__code?: string;
	size?: number;
};

export type IGenre = string;

export type IMovie = {
	id: number;
	title: string;
	description: string;
	rating: number;
	genres: IGenre[];
	year_released: string;
	date_created: string;
	folder_path: string;
	sub_folder_path: string;
	cover_image: string;
	media_files?: IMediaFile[];
};

export type ISeries = {
	id: number;
	title: string;
	description: string;
	rating: number;
	genres: IGenre[];
	year_released: string;
	date_created: string;
	folder_path: string;
	sub_folder_path: string;
	cover_image: string;
	season_count: number;
	episode_count?: number;
	seasons: ISeason[];
};

export type ISeason = {
	id: number;
	title: string;
	number: number;
	folder_path: string;
	cover_image: string;
	episode_count: number;
	episodes?: IEpisode[];
};

export type IEpisode = {
	id: number;
	number: number;
	title?: string;
	is_filler: boolean;
	media_files?: IMediaFile[];
	languages?: LanguageFolderNames[];
	season__title?: string;
	status__title?: string;
	status__code?: string;
};

export type IMediaFile = {
	id: number;
	width: number;
	height: number;
	duration: number;
	size: number;
	fps: number;
	frame_count: number;
	file_path: string;
	language_folder_path: string;
	language_name: string;
};

export enum LanguageFolderNames {
	GER_DUB = "GER DUB",
	GER_SUB = "GER SUB",
	ENG_SUB = "ENG SUB",
}
