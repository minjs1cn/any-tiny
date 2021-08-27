import fs from 'fs';
import path from 'path';

export function getFiles(dir: string) {
	const files: string[] = [];

	function findFiles(dir: string) {
		if (fs.statSync(dir).isFile()) {
			files.push(dir);
		} else {
			const files = fs.readdirSync(dir);
			files.forEach(file => {
				findFiles(path.join(dir, file));
			});
		}
	}

	if (fs.existsSync(dir)) {
		findFiles(dir);
	}

	return files;
}

export function createFilterByExt(ext: string) {
	const exts = ext.split(',');
	return (file: string) => exts.includes(path.extname(file));
}

export const imageFilter = createFilterByExt('.png');
