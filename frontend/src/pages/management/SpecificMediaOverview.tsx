import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { fetchMediaOverviewEpisodes } from "../../services";
import { LanguageFolderNames, type IEpisode } from "../../types";
const SpecificMediaOverview = () => {
	const location = useLocation();

	const { isPending, data: episode_list } = useQuery({
		queryKey: ["media", location.state.media.id],
		queryFn: async () => {
			const response = await fetchMediaOverviewEpisodes(
				location.state.media.id,
			);
			return response.episode_list;
		},
	});

	const renderLanguages = (episode: any) => {
		return (
			<div className="flex items-center gap-x-1">
				{episode.languages.map((lang: string, index: number) => (
					<img
						key={index}
						src={getLanguageIcon(lang)}
						className="p-1.5 h-8 my-1"
					></img>
				))}
			</div>
		);
	};

	const getLanguageIcon = (lang: string) => {
		switch (lang) {
			case LanguageFolderNames.GER_DUB.valueOf():
				return "/img/german.svg";
			case LanguageFolderNames.GER_SUB.valueOf():
				return "/img/japanese-german.svg";
			case LanguageFolderNames.ENG_SUB.valueOf():
				return "/img/japanese-english.svg";
		}
	};

	const renderStatus = (episode: IEpisode) => {
		switch (episode.status__code) {
			case "undefined": {
				return (
					<div className="p-1.5 h-8 flex items-center w-fit text-red-500 dark:text-red-500 bg-red-500/20 my-1 rounded-md">
						{episode.status__title}
					</div>
				);
			}
			case "missing": {
				return (
					<div className="p-1.5 h-8 flex items-center w-fit text-red-500 dark:text-red-500 bg-red-500/20 my-1 rounded-md">
						{episode.status__title}
					</div>
				);
			}
			case "uncompleted": {
				return (
					<div className="p-1.5 h-8 flex items-center w-fit text-amber-500 dark:text-amber-500 bg-amber-500/20 my-1 rounded-md">
						{episode.status__title}
					</div>
				);
			}
			case "completed": {
				return (
					<div className="p-1.5 h-8 flex items-center w-fit text-green-500 dark:text-green-500 bg-green-500/20 my-1 rounded-md">
						{episode.status__title}
					</div>
				);
			}
		}
	};

	return (
		<div className="flex flex-col gap-y-5 w-full">
			<p className="text-2xl font-semibold">
				{location.state.media.title}
			</p>
			<div>
				<table className="border-separate border-spacing-y-2 w-full">
					<thead>
						<tr>
							<th className="text-start px-2">Staffel</th>
							<th className="text-start px-2">Episode</th>
							<th className="text-start px-2">Titel</th>
							<th className="text-start px-2">Sprachen</th>
						</tr>
					</thead>
					<tbody>
						{isPending
							? Array.from({ length: 12 }).map((_, index) => (
									<tr
										key={index}
										className="bg-gray-100 dark:bg-gray-800 animate-pulse"
									>
										<td
											colSpan={4}
											className="rounded-md px-2 h-10"
										></td>
									</tr>
								))
							: episode_list?.map((episode, index) => (
									<tr
										className={`cursor-pointer h-10 bg-gray-100 dark:bg-gray-800`}
										key={index}
									>
										<td className="rounded-l-md px-2 truncate text-ellipsis">
											{episode.season__title}
										</td>
										<td className="px-2 truncate text-ellipsis">
											{episode.number}
										</td>
										<td className="px-2 truncate text-ellipsis">
											{episode.title}
										</td>
										<td className="px-2 truncate text-ellipsis">
											{renderLanguages(episode)}
										</td>
										<td className="rounded-r-md px-2 truncate text-ellipsis">
											{renderStatus(episode)}
										</td>
									</tr>
								))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default SpecificMediaOverview;
