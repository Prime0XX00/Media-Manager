import { Link } from "react-router-dom";
import type { ICollection } from "../types";
import { FolderIcon } from "lucide-react";

interface CollectionProps {
	collection: ICollection;
}

const Collection: React.FC<CollectionProps> = ({ collection }) => {
	return (
		<Link
			to={`/collection/${collection.title}/`}
			state={{ collection: collection }}
			className="flex flex-col gap-y-2 items-center w-full"
		>
			<div
				className={`w-full aspect-[1/1.5] bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-md overflow-hidden`}
			>
				<FolderIcon className="size-1/2 opacity-25"></FolderIcon>
			</div>
			<div className="flex flex-col items-center w-full gap-y-1">
				<p className="text-center truncate text-ellipsis w-full max-w-full">
					{collection.title}
				</p>
				<div className="grid grid-cols-3 gap-x-2 w-full">
					<p className="col-start-2 text-center bg-gray-100 dark:bg-gray-800 rounded-md px-2 w-fit justify-self-center text-nowrap">
						<span className="opacity-50">
							{collection.media_count}
						</span>
						<span className="opacity-50">
							{collection.media_count == 1
								? " Eintrag"
								: " Einträge"}
						</span>
					</p>
				</div>
			</div>
		</Link>
	);
};

export default Collection;
