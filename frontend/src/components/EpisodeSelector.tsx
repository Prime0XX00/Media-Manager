import { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { IEpisode } from "../types";

interface EpisodeSelectorProps {
	movies: boolean;
	loading: boolean;
	selectedPage: number;
	selectedEpisode: IEpisode | undefined;
	episodes: IEpisode[] | undefined;
	onEpisodeClick: (episode: IEpisode) => void;
}

const EpisodeSelector = ({ episodes, ...props }: EpisodeSelectorProps) => {
	const itemsPerPage = props.movies ? 8 : 40;

	const pages = episodes ? Math.ceil(episodes.length / itemsPerPage) : 0;

	const [currentPage, setCurrentPage] = useState<number>(props.selectedPage);
	const [itemsOnPage, setItemsOnPage] = useState<IEpisode[]>();

	useEffect(() => {
		const newItemsOnPage = episodes?.slice(
			currentPage * itemsPerPage,
			(currentPage + 1) * itemsPerPage,
		);
		setItemsOnPage(newItemsOnPage);
	}, [episodes, currentPage, itemsPerPage]);

	useEffect(() => {
		setCurrentPage(0);
	}, [episodes, itemsPerPage]);

	return (
		<div className="h-full flex flex-col justify-between gap-y-3">
			{!props.movies ? (
				<div className="grid grid-cols-5 grid-rows-8 gap-1.5 w-full">
					{itemsOnPage?.map((episode, index) => (
						<button
							key={index}
							onClick={() => props.onEpisodeClick(episode)}
							className={`${props.selectedEpisode == episode ? "bg-cyan-700 text-white" : "bg-gray-200 dark:bg-gray-700"} ${episode.status__code == "missing" ? "opacity-50" : ""} cursor-pointer py-1.5 rounded-md`}
						>
							{episode.number}
						</button>
					))}
				</div>
			) : (
				<div className="grid grid-cols-1 grid-rows-8 gap-1.5 w-full">
					{itemsOnPage?.map((episode, index) => (
						<button
							key={index}
							onClick={() => props.onEpisodeClick(episode)}
							className={`${props.selectedEpisode == episode ? "bg-cyan-700 text-white" : "bg-gray-200 dark:bg-gray-700"} ${episode.status__code == "missing" ? "opacity-50" : ""} text-nowrap truncate text-ellipsis cursor-pointer py-1.5 px-3 w-full rounded-md`}
						>
							{episode.title
								? episode.title
								: "Film " + episode.number}
						</button>
					))}
				</div>
			)}

			{pages > 1 && (
				<div className="flex justify-between gap-x-5 items-center">
					<button
						onClick={() => setCurrentPage((prev) => prev - 1)}
						disabled={currentPage == 0 ? true : false}
						className={`bg-gray-200 dark:bg-gray-700 rounded-md aspect-square! p-1.5 disabled:opacity-50 disabled:cursor-default cursor-pointer`}
					>
						<ChevronLeftIcon></ChevronLeftIcon>
					</button>
					{!props.loading && (
						<p>
							{currentPage + 1} / {pages}
						</p>
					)}

					<button
						onClick={() => setCurrentPage((prev) => prev + 1)}
						disabled={currentPage >= pages - 1 ? true : false}
						className={`bg-gray-200 dark:bg-gray-700 rounded-md aspect-square! p-1.5 disabled:opacity-50 disabled:cursor-default cursor-pointer`}
					>
						<ChevronRightIcon></ChevronRightIcon>
					</button>
				</div>
			)}
		</div>
	);
};

export default EpisodeSelector;
