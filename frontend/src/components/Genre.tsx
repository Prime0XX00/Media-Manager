import React from "react";
import type { IGenre } from "../types";

interface GenreProps {
	genre: IGenre;
}

const Genre: React.FC<GenreProps> = ({ genre }) => {
	return (
		<div className={`bg-gray-100 dark:bg-gray-800 rounded-md px-2`}>
			{genre}
		</div>
	);
};

export default Genre;
