import ffmpeg from 'fluent-ffmpeg';

export function videoPoster(
	input: string,
	output: string,
	position: number = 0,
): Promise<string> {
	let filename = '';
	return new Promise(resolve => {
		ffmpeg(input)
			.on('filenames', function (filenames) {
				filename = filenames[0];
			})
			.on('end', function () {
				resolve(filename);
			})
			.screenshots({
				// Will take screens at 20%, 40%, 60% and 80% of the video
				// count: 4,
				timestamps: [position],
				filename: '%b.png',
				folder: output,
			});
	});
}
