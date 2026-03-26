import { useState } from "react";
import { useDialog } from "../../context/DialogContext";
import type { ISeason } from "../../types";

interface SeasonSelectDialogProps {
	seasons?: ISeason[];
	selectedSeason?: ISeason;
	onSeasonSelect: (season: ISeason) => void;
}

const SeasonSelectDialog = ({ ...props }: SeasonSelectDialogProps) => {
	const { hideDialog } = useDialog();

	const [currentSelectedSeason, setCurrentSelectedSeason] = useState(
		props.selectedSeason,
	);

	return (
		<div className="flex flex-col gap-y-2">
			{props.seasons?.map((season, index) => (
				<button
					key={index}
					onClick={() => {
						props.onSeasonSelect(season);
						setCurrentSelectedSeason(season);
						hideDialog();
					}}
					className={`${currentSelectedSeason == season ? "bg-cyan-700 text-white" : "bg-gray-200 dark:bg-gray-700"} rounded-md py-2 cursor-pointer`}
				>
					{season.title}
				</button>
			))}
		</div>
	);
};

export default SeasonSelectDialog;
