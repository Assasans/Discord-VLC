import * as log4js from 'log4js';
import * as chalk from 'chalk';

const Logger = {
	preinit: log4js.getLogger("PreInit"),
	main: log4js.getLogger("Main"),

	mysql: log4js.getLogger("MySQL"),
	vlc: log4js.getLogger("VLC"),

	discord: log4js.getLogger("Discord")
};

export function registerLoggers() {
	log4js.configure({
		appenders: {
			console: {
				type: 'console',
				layout: {
					type: 'pattern',
					pattern: `%[[%d{hh:mm:ss}] [%p/${chalk.bold('%c')}]%]: %m`
				}
			}
		},
		categories: {
			default: {
				appenders: [
					'console'
				],
				level: 'trace'
			}
		}
	});
}

export default Logger;