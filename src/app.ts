import * as DiscordRPC from 'discord-rpc';

import * as Bluebird from 'bluebird';
import * as rp from 'request-promise';
import * as Luxon from 'luxon';
import * as chalk from 'chalk';
import * as _ from 'lodash';

import { ConfigHelper } from './helper/config';

import Logger, { registerLoggers } from './helper/logger';
registerLoggers();

const config = ConfigHelper.getConfig();

DiscordRPC.register(config.client_id);

const client = new DiscordRPC.Client({
	transport: 'ipc'
});

const startTimestamp: number = Luxon.DateTime.local().toMillis();

async function updateActivity() {
	const data = await getData();
	if(!data) {
		client.setActivity({
			details: `[ Не запущен ]`,
			startTimestamp: startTimestamp,
			largeImageKey: 'logo',
			largeImageText: `VLC`,
			instance: true
		});
		return;
	}

	const filename: string = data.state === 'stopped' ? '[ Остановлен ]' : data.information.category.meta.filename;
	const totalSeconds: number = data.length;
	const currentSeconds: number = data.time;

	const volume: number = Math.round(data.volume * 100 / 256);

	Logger.vlc.debug(`Информация от VLC: \nФайл: ${chalk.greenBright(filename)}\nГромкость: ${chalk.greenBright(`${volume}%`)}\nСостояние: ${chalk.greenBright(data.state)}\nДлинна файла: ${chalk.greenBright(Luxon.Duration.fromMillis(totalSeconds * 1000).toFormat('hh:mm:ss'))}\nТекущая позиция: ${chalk.greenBright(Luxon.Duration.fromMillis(currentSeconds * 1000).toFormat('hh:mm:ss'))}`);

	client.setActivity({
		details: `${filename}`,
		state: `${data.state === 'paused' ? '[Пауза] ' : ''}${Luxon.Duration.fromMillis(currentSeconds * 1000).toFormat('hh:mm:ss')} / ${Luxon.Duration.fromMillis(totalSeconds * 1000).toFormat('hh:mm:ss')}`,
		startTimestamp: startTimestamp,
		largeImageKey: 'logo',
		largeImageText: `Громкость: ${volume}%`,
		instance: true
	});
};

client.on('ready', async () => {
  console.log(`User: ${client.user.username}#${client.user.discriminator}`);

	setInterval(updateActivity, 10000);
	updateActivity();
});

async function getData(): Promise<any> {
	return new Bluebird(async (resolve, reject) => {
		rp({
			method: 'GET',
			uri: 'http://localhost:8080/requests/status.json',
			json: true,
			auth: {
				username: config.vlc.username,
				password: config.vlc.password
			}
		}).then((body) => {
			//console.log(body);
			return resolve(body);
		}).catch((error: Error) => {
			if(error.message.includes('ECONNREFUSED')) {
				Logger.vlc.debug('HTTP сервер VLC не запущен');
			} else if(error.message.includes('401')) {
				Logger.vlc.error('Ошибка входа в HTTP API!');
			} else {
				Logger.vlc.error(error);
			}
			return resolve(null);
		});
	});
}

client.login({
	clientId: config.client_id
}).then((client: DiscordRPC.Client) => {
	Logger.discord.info('Вход выполнен!');
}).catch((error: Error) => {
	Logger.discord.error(error);
});