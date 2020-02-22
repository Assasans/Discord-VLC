import * as JSON5 from 'json5';
import * as fs from 'fs';
import * as path from 'path';

export class ConfigHelper {
	public static getConfig(): any {
		const file: string = path.resolve('config.json5');
		const contents: string = fs.readFileSync(file).toString();
		return JSON5.parse(contents);
	}
}