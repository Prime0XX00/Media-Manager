import { useLocation } from "react-router-dom";
import SpecificSeries from "./SpecificSeries";

const SpecificMedia = () => {
	const location = useLocation();

	return <SpecificSeries media={location.state.media} />;
};

export default SpecificMedia;
