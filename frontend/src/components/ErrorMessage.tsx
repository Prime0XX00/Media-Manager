import { RotateCcwIcon } from "lucide-react";
import type { ApiError } from "../types";

interface ErrorMessage {
	error: ApiError;
	refetch: () => void;
}

const ErrorMessage = ({ error, refetch }: ErrorMessage) => {
	return (
		<div className="flex flex-col items-center">
			<div className="rounded-md mx-auto w-fit p-3 bg-red-700/30">
				{error.message}
			</div>
			<button
				onClick={() => refetch()}
				className="rounded-md bg-gray-100 dark:bg-gray-800 p-1 mx-auto mt-2"
			>
				<RotateCcwIcon className="opacity-50"></RotateCcwIcon>
			</button>
		</div>
	);
};

export default ErrorMessage;
