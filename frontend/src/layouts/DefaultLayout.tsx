import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const DefaultLayout = () => {
	return (
		<div className="min-h-screen flex flex-row">
			<div className="w-full flex flex-col">
				<Navbar></Navbar>
				{/* Outlet */}
				<div className="mt-(--spacing-navbar-h) min-h-[calc(100vh-var(--spacing-navbar-h))]">
					<div className="wrapper py-5">
						<Outlet></Outlet>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DefaultLayout;
