import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CollectionOverview from "./pages/CollectionOverview";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SpecificCollection from "./pages/SpecificCollection";
import SpecificMedia from "./pages/SpecificMedia";
import type { ApiError } from "./types";
import DefaultLayout from "./layouts/DefaultLayout";
import LightingModeProvider from "./context/LightingModeContext";
import DialogProvider from "./context/DialogContext";
import MediaOverview from "./pages/management/MediaOverview";
import SpecificMediaOverview from "./pages/management/SpecificMediaOverview";

const queryClient = new QueryClient();

export const runApiQuery = async <T = any,>(callback: Promise<Response>) => {
	try {
		const response = await callback;

		let json: any = null;
		try {
			json = await response.json();
		} catch (_) {
			json = null;
		}

		if (!response.ok) {
			const err: ApiError = Object.assign(
				new Error(json?.message || `Serverfehler`),
				{ status: response.status, body: json },
			);
			throw err;
		}

		return json as T;
	} catch (error) {
		if (error instanceof TypeError) {
			const err: ApiError = Object.assign(
				new Error("Backend nicht erreichbar"),
				{ status: 0, body: null },
			);
			throw err;
		}

		throw error;
	}
};

function App() {
	return (
		<>
			<LightingModeProvider>
				<DialogProvider>
					<QueryClientProvider client={queryClient}>
						<BrowserRouter>
							<Routes>
								<Route
									path="/"
									element={<DefaultLayout />}
								>
									<Route
										path=""
										element={<CollectionOverview />}
									/>
									<Route
										path="/collection/:collectionTitle/"
										element={<SpecificCollection />}
									/>
									<Route
										path="/collection/:collectionTitle/:mediaTitle/"
										element={<SpecificMedia />}
									/>
									<Route
										path="/management/"
										element={<MediaOverview />}
									/>
									<Route
										path="/management/:mediaTitle"
										element={<SpecificMediaOverview />}
									/>
								</Route>
							</Routes>
						</BrowserRouter>
					</QueryClientProvider>
				</DialogProvider>
			</LightingModeProvider>
		</>
	);
}

export default App;
