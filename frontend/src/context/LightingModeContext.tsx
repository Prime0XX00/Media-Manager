import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";

export enum LightingMode {
	"LIGHT",
	"DARK",
}

interface LightingModeProviderProps {
	children?: ReactNode;
}

interface LightingModeContextProps {
	lightingMode: LightingMode;
	toggleLightingMode: () => void;
}

const LightingModeContext = createContext<LightingModeContextProps | undefined>(
	undefined,
);

const LightingModeProvider: React.FC<LightingModeProviderProps> = ({
	...props
}) => {
	const [lightingMode, setLightingMode] = useState<LightingMode>(
		LightingMode.DARK,
	);

	useEffect(() => {
		if (lightingMode == LightingMode.DARK) {
			document.querySelector("html")?.classList.add("dark");
		} else {
			document.querySelector("html")?.classList.remove("dark");
		}
	}, [lightingMode]);

	const toggleLightingMode = () => {
		if (lightingMode == LightingMode.DARK) {
			setLightingMode(LightingMode.LIGHT);
		} else {
			setLightingMode(LightingMode.DARK);
		}
	};

	return (
		<LightingModeContext.Provider
			value={{ lightingMode, toggleLightingMode }}
		>
			{props.children}
		</LightingModeContext.Provider>
	);
};

export const useLightingMode = (): LightingModeContextProps => {
	const context = useContext(LightingModeContext);
	if (!context) {
		throw new Error(
			"useLightingMode muss innerhalb eines LightingModeProviders aufgerufen werden!",
		);
	}
	return context;
};

export default LightingModeProvider;
