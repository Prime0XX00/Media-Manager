export const convertByteToMB = (bytes: number) => {
	return Math.floor(bytes / (1024 * 1024));
};

export const formatDuration = (durationSeconds: number) => {
	let hours = Math.floor(durationSeconds / 3600);
	let minutes = Math.floor((durationSeconds - hours * 3600) / 60);
	let seconds = durationSeconds - hours * 3600 - minutes * 60;
	let timeString =
		hours.toString().padStart(2, "0") +
		":" +
		minutes.toString().padStart(2, "0") +
		":" +
		seconds.toString().padStart(2, "0");

	return timeString;
};
