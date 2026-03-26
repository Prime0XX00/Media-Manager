import { ImageIcon } from "lucide-react";
const VITE_PI_URL = import.meta.env.VITE_PI_URL;

interface MediaImageProps {
	image_path: string | undefined;
	loading: boolean;
	className?: string;
}

const MediaImage: React.FC<MediaImageProps> = ({
	className = "",
	image_path,
	loading,
}) => {
	return (
		<div
			className={`${className} w-full aspect-[1/1.5] bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-md overflow-hidden ${loading ? "animate-pulse" : ""}`}
		>
			{!loading && image_path && (
				<img src={`${VITE_PI_URL}/media/${image_path}`}></img>
			)}{" "}
			{!loading && !image_path && (
				<ImageIcon className="size-1/2 opacity-25"></ImageIcon>
			)}
		</div>
	);
};

export default MediaImage;
