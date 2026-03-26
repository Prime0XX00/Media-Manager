const CollectionSkeleton = () => {
	return (
		<div className="flex flex-col gap-y-2 items-center w-full">
			<div
				className={`w-full aspect-[1/1.5] bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-md overflow-hidden animate-pulse`}
			></div>
			<div className="flex flex-col items-center w-full gap-y-1">
				<p className="w-1/2 bg-gray-100 dark:bg-gray-800 h-6 rounded-md animate-pulse"></p>

				<p className="bg-gray-100 dark:bg-gray-800 h-6 rounded-md w-3/4 animate-pulse"></p>
			</div>
		</div>
	);
};

export default CollectionSkeleton;
