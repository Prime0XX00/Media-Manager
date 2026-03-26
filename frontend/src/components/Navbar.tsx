import { MoonIcon, PlayIcon, ShieldUserIcon, SunIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { LightingMode, useLightingMode } from "../context/LightingModeContext";

const Navbar = () => {
	const { lightingMode, toggleLightingMode } = useLightingMode();

	const navigate = useNavigate();

	return (
		<div className="fixed w-full top-0 z-1000 h-navbar-h bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
			<div className="wrapper flex w-full h-full items-center justify-between">
				{/* Navbar left side */}
				<Link
					to=""
					className="flex items-center justify-start gap-x-5"
				>
					<div className="bg-highlight size-8 flex items-center justify-center rounded-md">
						<PlayIcon
							fill="var(--color-white)"
							stroke="var(--color-white)"
						></PlayIcon>
					</div>
					<p className="text-xl">Media Manager</p>
				</Link>

				<div className="flex flex-row gap-x-2">
					<button
						onClick={() => toggleLightingMode()}
						className="rounded-md p-1.5 bg-gray-100 dark:bg-gray-800 cursor-pointer"
					>
						{lightingMode == LightingMode.LIGHT ? (
							<SunIcon></SunIcon>
						) : (
							<MoonIcon></MoonIcon>
						)}
					</button>
					<button
						onClick={() => navigate("/management/")}
						className="rounded-md p-1.5 bg-gray-100 dark:bg-gray-800 cursor-pointer"
					>
						<ShieldUserIcon></ShieldUserIcon>
					</button>
				</div>
			</div>
		</div>
	);
};

export default Navbar;
