import React, {
	createContext,
	useContext,
	useState,
	type ReactNode,
} from "react";
import Dialog from "../components/Dialog";

interface DialogProviderProps {
	children?: ReactNode;
}

interface DialogContextProps {
	showDialog: (content: ReactNode, headline: string) => void;
	hideDialog: () => void;
}

const DialogContext = createContext<DialogContextProps | undefined>(undefined);

const DialogProvider: React.FC<DialogProviderProps> = ({ ...props }) => {
	const [visible, setVisible] = useState(false);
	const [content, setContent] = useState<ReactNode>();
	const [headline, setHeadline] = useState<string>("");

	const showDialog = (content: ReactNode, headline: string) => {
		setContent(content);
		setHeadline(headline);
		setVisible(true);
	};

	const hideDialog = () => {
		setVisible(false);

		setTimeout(() => setContent(undefined), 300);
	};

	return (
		<DialogContext.Provider value={{ showDialog, hideDialog }}>
			<Dialog
				className={`${
					visible
						? "opacity-100 scale-100"
						: "opacity-0 scale-70 pointer-events-none"
				} transition-all duration-300`}
				headline={headline}
			>
				{content}
			</Dialog>
			<div
				className={`${
					visible
						? "fixed opacity-100"
						: "fixed opacity-0 pointer-events-none"
				} h-full w-full z-2000 bg-black/75 transition-opacity duration-300`}
				onClick={() => hideDialog()}
			></div>

			{props.children}
		</DialogContext.Provider>
	);
};

export const useDialog = (): DialogContextProps => {
	const context = useContext(DialogContext);
	if (!context) {
		throw new Error(
			"useDialog muss innerhalb eines DialogProviders aufgerufen werden!",
		);
	}
	return context;
};

export default DialogProvider;
