import { createFilterByExt, getFiles, mkdir } from '../utils';
import * as defaultConfig from './config';
import Listr, { ListrTask } from 'listr';
import { download, tiny } from './api';
import path from 'path';
import fs from 'fs';

type TProps = typeof defaultConfig;

type Optional<T> = {
	[index in keyof T]?: T[index];
};

export function tinypng(props: Optional<TProps>) {
	const config = {
		...defaultConfig,
		...props,
	};

	mkdir(config.output);

	if (fs.statSync(config.input).isFile()) {
		const taskList = new Listr([
			{
				title: config.input,
				task: async (ctx, task) => {
					try {
						const {
							input: { size: s1 },
							output: { size: s2, url, ratio },
						} = await tiny(config.input);

						const inputSize = (s1 / 1024).toFixed(2) + 'kb';
						const outputSize = (s2 / 1024).toFixed(2) + 'kb';
						task.title = ` ${outputSize} / ${inputSize} = ${ratio} ${config.input}`;

						const filename = path.relative(
							path.dirname(config.input),
							config.input,
						);
						const newFile = path.join(config.output, filename);
						mkdir(newFile);

						download(url, newFile);
					} catch (error: any) {
						task.title =
							(error && error.message ? error.message : 'error') +
							' ' +
							task.title;
					}
				},
			},
		]);

		taskList.run().catch(error => {
			console.error(error);
		});

		return;
	}

	const filter = createFilterByExt(config.extname);
	const files = getFiles(config.input, props.deep).filter(filter);

	const taskList = new Listr(files.map(file => createTinyTask(file, config)));

	taskList.run().catch(error => {
		console.error(error);
	});
}

function createTinyTask(filepath: string, config: TProps): ListrTask {
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

				const newFile = path.join(
					config.output,
					path.relative(config.input, filepath),
				);
				mkdir(newFile);

				download(url, newFile);
			} catch (error: any) {
				task.title =
					(error && error.message ? error.message : 'error') + ' ' + task.title;
			}
		},
	};
}
