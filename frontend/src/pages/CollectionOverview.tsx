import type { ApiError, ICollection } from "../types";
import { useQuery } from "@tanstack/react-query";
import { fetchCollections } from "../services";
import Collection from "../components/Collection";
import CollectionSkeleton from "../components/CollectionSkeleton";
import ErrorMessage from "../components/ErrorMessage";
import { useEffect } from "react";

const CollectionOverview = () => {
	const {
		isPending,
		isError,
		data: collections,
		error,
		refetch,
	} = useQuery<ICollection[], ApiError>({
		queryKey: ["collections"],
		queryFn: async () => {
			const response = await fetchCollections();
			return response.collections;
		},
	});

	useEffect(() => {
		document.title = "Media Manager";
	}, [location]);

	const skeletonAmount = 7;

	if (isError) {
		return (
			<ErrorMessage
				error={error}
				refetch={refetch}
			></ErrorMessage>
		);
	}

	return (
		<div className="grid xl:grid-cols-7 md:grid-cols-6 sm:grid-cols-5 grid-cols-3 md:gap-x-3 gap-x-2 xl:gap-y-15 sm:gap-y-15 gap-y-10 w-full">
			{isPending &&
				Array.from({ length: skeletonAmount }).map((_, index) => (
					<CollectionSkeleton key={index}></CollectionSkeleton>
				))}

			{collections?.map((collection) => (
				<Collection
					key={collection.id}
					collection={collection}
				></Collection>
			))}
		</div>
	);
};

export default CollectionOverview;
