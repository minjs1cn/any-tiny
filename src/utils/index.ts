import fs from 'fs';
import path from 'path';

export function getFiles(dir: string, deep: boolean = false) {
	const output: string[] = [];

	function findFiles(dir: string, deep: boolean) {
		if (fs.statSync(dir).isFile()) {
			output.push(dir);
		} else {
			if (deep === false) return;
			const files = fs.readdirSync(dir);
			files.forEach(file => {
				findFiles(path.join(dir, file), deep);
			});
		}
	}

	if (fs.existsSync(dir)) {
		if (fs.statSync(dir).isFile()) {
			output.push(dir);
		} else {
			const files = fs.readdirSync(dir);
			files.forEach(file => {
				findFiles(path.join(dir, file), deep);
			});
		}
	}

	return output;
}

export function createFilterByExt(ext: string) {
	const exts = ext.split(',');
	return (file: string) => exts.includes(path.extname(file));
}

let dirCache = new Set();

export function mkdir(dir: string) {
	if (dirCache.has(dir)) {
		return;
	}
	dirCache.add(dir);

	let base = '.';

	getDirname(dir)
		.split('/')
		.forEach(dir => {
			base = path.join(base, dir);
			if (!fs.existsSync(base)) {
				fs.mkdirSync(base);
			}
		});
}

export function getDirname(filename: string) {
	return path.dirname(filename);
}
