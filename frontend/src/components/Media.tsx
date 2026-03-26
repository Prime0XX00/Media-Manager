import React from "react";
import { type IMedia } from "../types";
import { Link } from "react-router-dom";
import MediaImage from "./MediaImage";

interface MediaProps {
	media: IMedia;
}

const Media: React.FC<MediaProps> = ({ media }) => {
	return (
		<Link
			to={`${media.folder_path.replaceAll(" ", "-")}`}
			state={{
				media: media,
			}}
			className="flex flex-col gap-y-2 items-center w-full"
		>
			<MediaImage
				image_path={media.cover_image}
				loading={false}
			/>
			<div className="flex flex-col items-center w-full gap-y-1">
				<p className="text-lg text-center truncate text-ellipsis w-full max-w-full">
					{media.title}
				</p>
				<div className="grid grid-cols-3 gap-x-2 w-full">
					<p className="col-start-2 text-center bg-gray-100 dark:bg-gray-800 rounded-md px-2 w-fit justify-self-center">
						<span className="opacity-50">
							{media.year_released}
						</span>
					</p>
				</div>
			</div>
		</Link>
	);
};

export default Media;
