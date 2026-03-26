import {
	AudioLinesIcon,
	ChevronDown,
	ChevronLeftIcon,
	ChevronRightIcon,
	Clock4Icon,
	CopyIcon,
	FileXIcon,
	HardDriveIcon,
	Loader2Icon,
	StarIcon,
	VectorSquare,
} from "lucide-react";
import type { IEpisode, IMedia, IMediaFile, ISeason, ISeries } from "../types";
import { useQuery } from "@tanstack/react-query";
import { fetchEpisode, fetchSeriesContent } from "../services";
import Genre from "../components/Genre";
import { useEffect, useState } from "react";
import EpisodeSelector from "../components/EpisodeSelector";
import SeasonSelectDialog from "../components/Dialogs/SeasonSelectDialog";
import { useDialog } from "../context/DialogContext";
import MediaImage from "../components/MediaImage";
import { convertByteToMB, formatDuration } from "../helpers";

const VITE_PI_URL = import.meta.env.VITE_PI_URL;

interface SpecificSeriesProps {
	media: IMedia;
}

const SpecificSeries: React.FC<SpecificSeriesProps> = ({ media }) => {
	const [selectedSeason, setSelectedSeason] = useState<ISeason>();
	const [selectedEpisode, setSelectedEpisode] = useState<IEpisode>();
	const [selectedMediaFile, setSelectedMediaFile] = useState<IMediaFile>();

	useEffect(() => {
		document.title = `Media Manager - ${media?.title || ""}`;
	}, [media]);

	const { showDialog } = useDialog();

	const { isPending: seriesIsPending, data: series } = useQuery({
		queryKey: ["media", media.id],
		queryFn: async () => {
			const response = await fetchSeriesContent(media.id);
			return response.contents;
		},
	});

	const { isPending: episodeIsPending, data: episode } = useQuery({
		queryKey: ["episode", selectedEpisode?.id],
		queryFn: async () => {
			const response = await fetchEpisode(selectedEpisode?.id || -1);
			return response.episode;
		},
		enabled: !!selectedEpisode?.id,
	});

	const getFirstSeason = (series: ISeries): ISeason => {
		for (let i = 0; i < series?.seasons.length; i++) {
			let current_season = series?.seasons[i];
			if (current_season.title.startsWith("Staffel")) {
				return current_season;
			}
		}
		return series?.seasons[0];
	};

	const onSeasonChange = (season: ISeason) => {
		setSelectedSeason(season);
	};

	const onEpisodeChange = (episode: IEpisode) => {
		setSelectedEpisode(episode);
	};

	const onMediaFileChange = (media_file: IMediaFile) => {
		setSelectedMediaFile(media_file);
	};

	const getEpisodeIndex = () => {
		if (selectedEpisode) {
			return selectedSeason?.episodes?.indexOf(selectedEpisode);
		}
	};

	const isFirstEpisode = (): boolean => {
		if (selectedEpisode) {
			const index = getEpisodeIndex();
			if (index == 0) return true;
		}
		return false;
	};

	const isLastEpisode = (): boolean => {
		if (selectedEpisode) {
			const index = getEpisodeIndex();
			if (index == undefined) return false;
			if (index + 1 == selectedSeason?.episodes?.length) return true;
		}
		return false;
	};

	const handlePrevEpisode = () => {
		if (selectedEpisode) {
			const index = getEpisodeIndex();
			if (index == undefined) return;
			const prevEpisode = selectedSeason?.episodes?.[index - 1];
			if (!prevEpisode) return;
			setSelectedEpisode(prevEpisode);
		}
	};

	const handleNextEpisode = () => {
		if (selectedEpisode) {
			const index = getEpisodeIndex();
			if (index == undefined) return;
			const nextEpisode = selectedSeason?.episodes?.[index + 1];
			if (!nextEpisode) return;
			setSelectedEpisode(nextEpisode);
		}
	};

	useEffect(() => {
		if (series) {
			const new_season = getFirstSeason(series);
			setSelectedSeason(new_season);
		}
	}, [series]);

	useEffect(() => {
		if (selectedSeason) {
			setSelectedEpisode(selectedSeason.episodes?.[0]);
		}
	}, [selectedSeason]);

	useEffect(() => {
		if (episode) {
			setSelectedMediaFile(episode.media_files?.[0]);
		}
	}, [episode]);

	return (
		<div className="flex flex-col gap-y-5">
			<div className="grid lg:grid-cols-[1fr_3fr_1fr] md:grid-cols-[8fr_4fr] grid-cols-1 justify-between lg:gap-y-0 md:gap-y-5 gap-y-5 gap-x-5">
				{/* Bild, Titel & Genres */}
				<div className="lg:col-span-1 md:col-span-2 h-fit flex flex-col gap-y-3">
					<MediaImage
						className="lg:flex hidden"
						image_path={series?.cover_image}
						loading={seriesIsPending}
					></MediaImage>
					<p className="text-2xl font-semibold">{media.title}</p>
					<div className="flex flex-wrap gap-x-1 gap-y-2">
						{seriesIsPending
							? Array.from({ length: 6 }).map((_, index) => (
									<div
										key={index}
										className="dark:bg-gray-800 bg-gray-100 rounded-md px-2 w-20 h-6 animate-pulse"
									></div>
								))
							: series?.genres?.map((genre, index) => (
									<Genre
										key={index}
										genre={genre}
									/>
								))}
					</div>

					{media.rating && (
						<div className="grid grid-cols-10 lg:w-full lg:justify-between gap-x-1 w-fit">
							{Array.from({ length: media.rating }).map(
								(_, index) => (
									<StarIcon
										key={index}
										fill="var(--color-star)"
										stroke="var(--color-star)"
										className="lg:size-full"
									></StarIcon>
								),
							)}
							{Array.from({ length: 10 - media.rating }).map(
								(_, index) => (
									<StarIcon
										key={index}
										fill="var(--color-star-empty)"
										stroke="var(--color-star-empty)"
										className="lg:size-full"
									></StarIcon>
								),
							)}
						</div>
					)}
				</div>

				{/* Videobereich */}
				<div className="bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
					<div className="w-full aspect-video bg-gray-300 dark:bg-gray-950 flex items-center justify-center">
						{series &&
						selectedMediaFile &&
						selectedSeason &&
						!episodeIsPending &&
						!seriesIsPending ? (
							<video
								controls
								src={`${VITE_PI_URL}/media/${series?.sub_folder_path}/${series?.folder_path}/${selectedMediaFile?.language_folder_path}/${selectedSeason?.title}/${selectedMediaFile?.file_path}`}
								className="w-full h-full aspect-video bg-black"
							></video>
						) : !seriesIsPending &&
						  (series?.seasons?.length == 0 ||
								episode?.media_files?.length == 0) ? (
							<FileXIcon className="size-1/3 text-gray-400 dark:text-gray-800"></FileXIcon>
						) : (
							<Loader2Icon className="animate-spin size-1/3 text-gray-400 dark:text-gray-800"></Loader2Icon>
						)}
					</div>
					<div className="flex flex-col gap-y-3 p-3">
						<div className="flex justify-between items-center gap-x-5">
							{seriesIsPending ? (
								<div className="dark:bg-gray-700 bg-gray-200 w-80 h-7 animate-pulse rounded-md"></div>
							) : selectedSeason || selectedEpisode ? (
								<p className="flex lg:gap-x-5 gap-x-2 text-xl min-w-0">
									<span className="text-nowrap">
										{selectedSeason?.title}
									</span>
									<span>-</span>
									<span className="text-nowrap">
										{(!selectedSeason?.title.startsWith(
											"Staffel",
										)
											? "Film "
											: "Folge ") +
											selectedEpisode?.number}
									</span>
									{selectedEpisode?.title && (
										<>
											<span>:</span>
											<span className="truncate text-ellipsis">
												{selectedEpisode.title}
											</span>
										</>
									)}
								</p>
							) : (
								<p>Keine Inhalte hinzugefügt.</p>
							)}

							<div className="flex gap-x-3 shrink-0">
								<button
									onClick={() => handlePrevEpisode()}
									disabled={
										isFirstEpisode() ||
										seriesIsPending ||
										!selectedSeason ||
										!selectedEpisode
											? true
											: false
									}
									className="disabled:opacity-50 disabled:cursor-default cursor-pointer bg-gray-200 dark:bg-gray-700 p-1.5 rounded-md"
								>
									<ChevronLeftIcon></ChevronLeftIcon>
								</button>
								<button
									onClick={() => handleNextEpisode()}
									disabled={
										isLastEpisode() ||
										seriesIsPending ||
										!selectedSeason ||
										!selectedEpisode
											? true
											: false
									}
									className="disabled:opacity-50 disabled:cursor-default cursor-pointer bg-gray-200 dark:bg-gray-700 p-1.5 rounded-md"
								>
									<ChevronRightIcon></ChevronRightIcon>
								</button>
							</div>
						</div>

						{!seriesIsPending &&
						(series?.seasons?.length == 0 ||
							episode?.media_files?.length == 0) ? (
							<></>
						) : (
							<>
								<hr className="border border-gray-300 dark:border-gray-600 border-dashed"></hr>
								<div className="flex flex-row gap-x-3 items-center">
									<AudioLinesIcon></AudioLinesIcon>
									<div className="flex flex-row gap-x-2">
										{seriesIsPending || episodeIsPending
											? Array.from({ length: 1 }).map(
													(_, index) => (
														<div
															key={index}
															className="dark:bg-gray-700 bg-gray-200 w-40 h-8 animate-pulse rounded-md"
														></div>
													),
												)
											: episode?.media_files?.map(
													(media_file) => (
														<button
															key={media_file.id}
															className={`${selectedMediaFile?.id == media_file.id ? "bg-cyan-700 text-white" : "bg-gray-200 dark:bg-gray-700"} cursor-pointer w-fit px-2 py-1 rounded-md`}
															onClick={() =>
																onMediaFileChange(
																	media_file,
																)
															}
														>
															{
																media_file.language_name
															}
														</button>
													),
												)}
									</div>
								</div>

								<div className="lg:flex lg:gap-x-5 grid grid-cols-2 gap-2 w-full opacity-75 font-light">
									{seriesIsPending || episodeIsPending ? (
										Array.from({ length: 4 }).map(
											(_, index) => (
												<div
													key={index}
													className="dark:bg-gray-700 bg-gray-200 lg:max-w-1/5 lg:w-40 w-full h-8 animate-pulse rounded-md"
												></div>
											),
										)
									) : (
										<>
											<div className="flex justify-between items-center lg:gap-x-3 gap-x-1 bg-gray-200 dark:bg-gray-700 rounded-md px-2 py-1">
												<Clock4Icon></Clock4Icon>
												<p>
													{selectedMediaFile?.duration &&
														formatDuration(
															selectedMediaFile.duration,
														)}
												</p>
											</div>
											<div className="flex justify-between items-center lg:gap-x-3 gap-x-1 bg-gray-200 dark:bg-gray-700 rounded-md px-2 py-1">
												<CopyIcon></CopyIcon>
												<p>
													{selectedMediaFile?.fps &&
														Math.floor(
															selectedMediaFile.fps,
														) + " FPS"}
												</p>
											</div>

											<div className="flex justify-between items-center lg:gap-x-3 gap-x-1 bg-gray-200 dark:bg-gray-700 rounded-md px-2 py-1">
												<VectorSquare></VectorSquare>
												<p>
													{selectedMediaFile?.width}x
													{selectedMediaFile?.height}
												</p>
											</div>
											<div className="flex justify-between items-center lg:gap-x-3 gap-x-1 bg-gray-200 dark:bg-gray-700 rounded-md px-2 py-1">
												<HardDriveIcon></HardDriveIcon>
												<p>
													{selectedMediaFile?.size &&
														convertByteToMB(
															selectedMediaFile.size,
														) + " MB"}
												</p>
											</div>
										</>
									)}
								</div>
							</>
						)}
					</div>
				</div>

				{/* Episoden & Staffeln */}
				<div
					className={`${seriesIsPending ? "animate-pulse" : ""} bg-gray-100 dark:bg-gray-800 flex flex-col gap-y-5 rounded-md p-3 min-h-10`}
				>
					{!seriesIsPending && series?.seasons?.length != 0 && (
						<>
							<button
								onClick={() =>
									showDialog(
										<SeasonSelectDialog
											seasons={series?.seasons}
											selectedSeason={selectedSeason}
											onSeasonSelect={(season) =>
												onSeasonChange(season)
											}
										></SeasonSelectDialog>,
										"Staffel auswählen",
									)
								}
								className="relative bg-gray-200 dark:bg-gray-700 py-1.5 rounded-md cursor-pointer"
							>
								<p>{selectedSeason?.title}</p>
								<ChevronDown className="absolute top-1/2 -translate-y-1/2 right-3"></ChevronDown>
							</button>
							<EpisodeSelector
								movies={
									!selectedSeason?.title.startsWith("Staffel")
								}
								loading={seriesIsPending}
								episodes={selectedSeason?.episodes}
								selectedPage={0}
								selectedEpisode={selectedEpisode}
								onEpisodeClick={(episode) =>
									onEpisodeChange(episode)
								}
							></EpisodeSelector>
						</>
					)}
				</div>
			</div>

			{/* Beschreibung */}
			{!seriesIsPending && !series?.description ? (
				<></>
			) : (
				<div className="grid grid-cols-[1fr_3fr_1fr] gap-x-5">
					<div
						className={`${seriesIsPending ? "h-30 animate-pulse" : ""} bg-gray-100 dark:bg-gray-800 lg:col-start-2 lg:col-span-2 col-span-3 p-3 rounded-md`}
					>
						{!seriesIsPending &&
							(series?.description
								? series.description
								: "Keine Beschreibung hinterlegt.")}
					</div>
				</div>
			)}
		</div>
	);
};

export default SpecificSeries;
