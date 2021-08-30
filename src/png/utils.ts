import fs from 'fs';
import path from 'path';

export function getFiles(dir: string, deep: boolean = false) {
	const files: string[] = [];

	function findFiles(dir: string, deep: boolean) {
		if (fs.statSync(dir).isFile()) {
			files.push(dir);
		} else {
			if (deep === false) return;
			const files = fs.readdirSync(dir);
			files.forEach(file => {
				findFiles(path.join(dir, file), deep);
			});
		}
	}

	if (fs.existsSync(dir)) {
		const files = fs.readdirSync(dir);
		files.forEach(file => {
			findFiles(path.join(dir, file), deep);
		});
	}

	return files;
}

export function createFilterByExt(ext: string) {
	const exts = ext.split(',');
	return (file: string) => exts.includes(path.extname(file));
}

export const imageFilter = createFilterByExt('.png');
