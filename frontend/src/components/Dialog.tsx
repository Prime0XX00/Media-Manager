import { XIcon } from "lucide-react";
import React, { type HTMLAttributes } from "react";
import { useDialog } from "../context/DialogContext";

interface DialogProps extends HTMLAttributes<HTMLDivElement> {
	headline: string;
}

const Dialog: React.FC<DialogProps> = ({ ...props }) => {
	const { hideDialog } = useDialog();

	return (
		<div
			className={`${props.className} p-5 fixed z-2100 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 min-h-32 min-w-96 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 max-h-[80vh] overflow-y-auto flex flex-col gap-y-3`}
		>
			<div className="flex justify-between gap-x-5 items-center">
				<p className="text-xl font-semibold">{props.headline}</p>
				<button
					onClick={() => hideDialog()}
					className="bg-gray-200 dark:bg-gray-700 p-1.5 rounded-md cursor-pointer"
				>
					<XIcon></XIcon>
				</button>
			</div>
			<hr className="border border-gray-300 dark:border-gray-600 border-dashed"></hr>
			{props.children}
		</div>
	);
};

export default Dialog;
