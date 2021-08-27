import { createFilterByExt, getFiles, imageFilter } from './utils';
import * as defaultConfig from './config';
import Listr, { ListrTask } from 'listr';
import { download, tiny } from './api';
import fs from 'fs';
import path from 'path';

interface IProps {
	input: string;
	output: string;
	extname: string;
}

type Optional<T> = {
	[index in keyof T]?: T[index];
};

export function tinypng(props: Optional<IProps>) {
	const config = {
		...props,
		...defaultConfig,
	};

	const filter = createFilterByExt(config.extname);
	const files = getFiles(config.input).filter(filter);

	const taskList = new Listr(files.map(file => createTinyTask(file, config)));

	taskList.run().catch(error => {
		console.error(error);
	});
}

function createTinyTask(filepath: string, config: IProps): ListrTask {
	return {
		title: filepath,
		task: async (ctx, task) => {
			try {
				const {
					input: { size: s1 },
					output: { size: s2, url, ratio },
				} = await tiny(filepath);
				const inputSize = (s1 / 1024).toFixed(2) + 'kb';
				const outputSize = (s2 / 1024).toFixed(2) + 'kb';
				task.title = ` ${outputSize} / ${inputSize} = ${ratio} ${filepath}`;
				const newFile = filepath.replace(config.input, config.output);
				let outDir = './';
				path
					.dirname(newFile)
					.split('/')
					.forEach(dir => {
						outDir += dir + '/';
						if (!fs.existsSync(outDir)) {
							fs.mkdirSync(outDir);
						}
					});
				download(url, newFile);
			} catch (error) {
				task.title = error.message + ' ' + task.title;
			}
		},
	};
}
