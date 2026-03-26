import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { fetchCollectionMedias } from "../services";
import Media from "../components/Media";
import { useEffect, useState } from "react";
import type { ApiError, IMedia } from "../types";
import ErrorMessage from "../components/ErrorMessage";
import CollectionSkeleton from "../components/CollectionSkeleton";

const SpecificCollection = () => {
	const location = useLocation();

	const {
		isPending,
		isError,
		data: collection_medias,
		error,
		refetch,
	} = useQuery<IMedia[], ApiError>({
		queryKey: ["collection", location.state.collection.id],
		queryFn: async () => {
			const response = await fetchCollectionMedias(
				location.state.collection.id,
			);
			return response.media_list;
		},
	});

	const onSearchChange = (searchTerm: string) => {
		setSearchTerm(searchTerm);
	};

	const [filteredMedias, setFilteredMedias] = useState<IMedia[] | undefined>(
		collection_medias,
	);
	const [searchTerm, setSearchTerm] = useState<string>("");

	useEffect(() => {
		if (searchTerm == "") {
			setFilteredMedias(collection_medias);
			return;
		}

		const new_medias = collection_medias?.filter((media) =>
			media.title.toLowerCase().includes(searchTerm.toLowerCase()),
		);
		setFilteredMedias(new_medias);
	}, [collection_medias, searchTerm]);

	useEffect(() => {
		document.title = `Media Manager - ${location.state.collection?.title || ""}`;
	}, [location]);

	const skeletonAmount = 28;

	if (isError) {
		return (
			<ErrorMessage
				error={error}
				refetch={refetch}
			></ErrorMessage>
		);
	}

	return (
		<div className="flex flex-col gap-y-5 w-full">
			<div className="flex justify-between gap-x-5 items-center">
				<div className="flex flex-row gap-x-2 items-center">
					<p className="text-2xl font-semibold">
						{location.state.collection.title}
					</p>
				</div>

				<div className="">
					<input
						onChange={(e) => onSearchChange(e.target.value)}
						value={searchTerm}
						placeholder="Suchen..."
						className="bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-1"
					></input>
				</div>
			</div>

			{!isPending && filteredMedias?.length == 0 ? (
				<p className="text-xl text-center">
					Keine Suchergebnisse gefunden.
				</p>
			) : (
				<div className="grid xl:grid-cols-7 md:grid-cols-6 sm:grid-cols-5 grid-cols-3 md:gap-x-3 gap-x-2 xl:gap-y-15 sm:gap-y-15 gap-y-10 w-full">
					{isPending &&
						Array.from({ length: skeletonAmount }).map(
							(_, index) => (
								<CollectionSkeleton
									key={index}
								></CollectionSkeleton>
							),
						)}

					{filteredMedias?.map((media) => (
						<Media
							key={media.id}
							media={media}
						></Media>
					))}
				</div>
			)}
		</div>
	);
};

export default SpecificCollection;
