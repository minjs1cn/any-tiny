import fs from 'fs';
import https from 'https';

const option = {
	hostname: 'tinypng.com',
	port: 443,
	path: '/web/shrink',
	method: 'POST',
	headers: {
		'User-Agent':
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
	},
};

interface TinyResponse {
	error?: string;
	message?: string;
	input: {
		size: number;
		type: string;
	};
	output: {
		size: number;
		type: string;
		width: number;
		height: number;
		ratio: number;
		url: string;
	};
}

export function tiny(filepath: string): Promise<TinyResponse> {
	return new Promise((resolve, reject) => {
		fs.createReadStream(filepath).pipe(
			https.request(option, res => {
				let response = '';
				res.on('data', data => {
					response += data;
				});
				res.on('end', () => {
					try {
						let data = JSON.parse(response) as TinyResponse;
						if (!data.error) {
							resolve(data);
						} else {
							reject(Error(data.message));
						}
					} catch (error) {
						reject(error);
					}
				});
			}),
		);
	});
}

export function download(url: string, output: string) {
	return new Promise(resolve => {
		https.get(url, res => {
			res.pipe(fs.createWriteStream(output));
			res.on('end', () => {
				resolve(output);
			});
		});
	});
}
