import { CheckIcon, FolderSyncIcon, XIcon } from "lucide-react";
import { fetchMediaDashboard, fetchSyncSeries } from "../../services";
import { useQuery } from "@tanstack/react-query";
import type { IMedia } from "../../types";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { convertByteToMB } from "../../helpers";

const MediaOverview = () => {
	const {
		isPending,
		data: collection_medias,
		refetch,
	} = useQuery({
		queryKey: ["media"],
		queryFn: async () => {
			const response = await fetchMediaDashboard();
			return response.media_list;
		},
	});

	const [syncing, setSyncing] = useState(0);

	const navigate = useNavigate();

	const handleMediaClick = (media: IMedia) => {
		navigate(media.folder_path.replaceAll(" ", "-"), {
			state: { media: media },
		});
	};

	const onSyncClick = async (media: IMedia) => {
		setSyncing(media.id);
		await fetchSyncSeries(media.id);
		await refetch();
		setSyncing(0);
	};

	const renderStatus = (media: IMedia) => {
		switch (media.status__code) {
			case "undefined": {
				return (
					<div className="p-1.5 h-8 flex items-center w-fit text-red-500 dark:text-red-500 bg-red-500/20 my-1 rounded-md">
						{media.status__title}
					</div>
				);
			}
			case "uncompleted": {
				return (
					<div className="p-1.5 h-8 flex items-center w-fit text-amber-500 dark:text-amber-500 bg-amber-500/20 my-1 rounded-md">
						{media.status__title}
					</div>
				);
			}
			case "completed": {
				return (
					<div className="p-1.5 h-8 flex items-center w-fit text-green-500 dark:text-green-500 bg-green-500/20 my-1 rounded-md">
						{media.status__title}
					</div>
				);
			}
		}
	};

	return (
		<div>
			<table className="border-separate border-spacing-y-2 w-full">
				<thead>
					<tr>
						<th className="text-start px-2">ID</th>
						<th className="text-start px-2">Titel</th>
						<th className="text-start px-2">Bild</th>
						<th className="text-start px-2">Status</th>
						<th className="text-start px-2">Jahr</th>
						<th className="text-start px-2">Staffeln</th>
						<th className="text-start px-2">Episoden</th>
						<th className="text-start px-2">Specials</th>
						<th className="text-start px-2">Sync Datum</th>
						<th className="text-start px-2">Sync</th>
						<th className="text-start px-2">Größe</th>
					</tr>
				</thead>
				<tbody>
					{isPending
						? Array.from({ length: 20 }).map((_, index) => (
								<tr
									key={index}
									className="bg-gray-100 dark:bg-gray-800 animate-pulse"
								>
									<td
										colSpan={11}
										className="rounded-md px-2 h-10"
									></td>
								</tr>
							))
						: collection_medias?.map((media) => (
								<tr
									className={`bg-gray-100 dark:bg-gray-800 min-h-10 ${syncing == media.id ? "disabled:cursor-default animate-pulse" : "cursor-pointer"}`}
									onClick={
										syncing != 0
											? undefined
											: () => handleMediaClick(media)
									}
									key={media.id}
								>
									<td className="rounded-l-md px-2 truncate text-ellipsis">
										{media.id}
									</td>
									<td className="px-2 truncate text-ellipsis">
										{media.title}
									</td>

									<td className="px-2 truncate text-ellipsis">
										{media.cover_image ? (
											<CheckIcon className="p-1.5 size-8 text-green-500 dark:text-green-500 bg-green-500/20 my-1 rounded-md"></CheckIcon>
										) : (
											<XIcon className="p-1.5 size-8 text-red-500 dark:text-red-500 bg-red-500/20 my-1 rounded-md"></XIcon>
										)}
									</td>
									<td className="px-2 truncate text-ellipsis">
										{renderStatus(media)}
									</td>
									<td className="px-2 truncate text-ellipsis">
										{media.year_released}
									</td>
									<td className="px-2 truncate text-ellipsis">
										{media.season_count}
									</td>
									<td className="px-2 truncate text-ellipsis">
										{media.episode_count}
									</td>
									<td className="px-2 truncate text-ellipsis">
										{media.special_episode_count}
									</td>
									<td className="px-2 truncate text-ellipsis">
										{media.date_last_synced?.toString()}
									</td>
									<td className="px-2 truncate text-ellipsis">
										<button
											disabled={syncing != 0}
											onClick={(e) => {
												e.stopPropagation();
												onSyncClick(media);
											}}
											className="bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center p-1.5 size-8 my-1 cursor-pointer disabled:opacity-50 disabled:cursor-default"
										>
											<FolderSyncIcon></FolderSyncIcon>
										</button>
									</td>
									<td className="rounded-r-md px-2 truncate text-ellipsis">
										{media.size
											? convertByteToMB(
													media.size,
												).toLocaleString() + " MB"
											: ""}
									</td>
								</tr>
							))}
				</tbody>
			</table>
		</div>
	);
};

export default MediaOverview;
