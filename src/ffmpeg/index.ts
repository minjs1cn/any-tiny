import { createFilterByExt, getDirname, getFiles, mkdir } from '../utils';
import * as defaultConfig from './config';
import Listr, { ListrTask } from 'listr';
import { videoPoster } from './api';
import { tiny, download } from '../png/api';
import path from 'path';

type TProps = typeof defaultConfig;

type Optional<T> = {
	[index in keyof T]?: T[index];
};

export function createVideoPoster(props: Optional<TProps>) {
	const config = {
		...defaultConfig,
		...props,
	};

	const filter = createFilterByExt(config.extname);
	const files = getFiles(config.input, props.deep).filter(filter);

	const taskList = new Listr(files.map(file => createPosterTask(file, config)));

	taskList.run().catch(error => {
		console.error(error);
	});
}

function createPosterTask(filepath: string, config: TProps): ListrTask {
	const dir = getDirname(filepath);

	let output = config.output;

	if (dir.includes('/')) {
		output = path.join(config.output, dir.split('/').splice(1).join('/'));
	}

	mkdir(output);

	return {
		title: filepath,
		task: async (ctx, task) => {
			try {
				let filename = await videoPoster(filepath, output, config.position);

				filename = path.join(output, filename);

				task.title = filename;
				if (config.compress) {
					const {
						input: { size: s1 },
						output: { size: s2, url, ratio },
					} = await tiny(filename);
					const inputSize = (s1 / 1024).toFixed(2) + 'kb';
					const outputSize = (s2 / 1024).toFixed(2) + 'kb';
					task.title = ` ${outputSize} / ${inputSize} = ${ratio} ${filename}`;

					mkdir(filename);

					download(url, filename);
				}
			} catch (error: any) {
				task.title =
					(error && error.message ? error.message : 'error') + ' ' + task.title;
			}
		},
	};
}
