import fs from 'fs';
const commands_runned = 0;
const time = new Date();
const time_executed = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;

const readSettings = () => {
	const jsonfile = require('jsonfile');
	const path = 'config.json';
	try {
	    fs.accessSync(path, fs.F_OK);
	    var settings = jsonfile.readFileSync(path);
	   	return settings;
	} catch (e) {
	    var settings = {
					"token": "none",
					"torrent_channel": "none",
					"torrent_role": "Torrents enabled",
					"torrent_server": "deluge",
					"delugeUrl": '127.0.0.1:8112/json',
					"delugePassword": 'password',
					"qbHost": '127.0.0.1',
					"qbPort": '8080',
					"qbUsername": "admin",
					"qbPassword": "password"
				};
		writeSettings(settings);
		return settings;
	}
};

const readLabels = () => {
	const jsonfile = require('jsonfile');
	const path = 'labels.json';
	try {
	    fs.accessSync(path, fs.F_OK);
	    var settings = jsonfile.readFileSync(path);
	   	return settings;
	} catch (e) {
	    var settings = null;
		return settings;
	}
};

var writeSettings = settings => {
	const jsonfile = require('jsonfile');
	const file = './config.json';
	const obj = settings;
	jsonfile.writeFileSync(file, obj);
};

const checkChannels = (channels, desired_channel, channel_type, callback) => {
	var channel_type = channel_type || '0';
	channels.forEach((channel, index, array) => {
		if(channel.name == desired_channel && channel.type == channel_type) {
			callback(true);
		}
	});
};

const checkRoles = (roles, desired_role, callback) => {
	roles.forEach((role, index, array) => {
		if(role.name == desired_role) {
			callback(true);
		}
	});
};

const checkSettingsChannel = (settings, callback) => {
	if(settings['torrent_channel'] == 'none')
		callback(true);
	else
		callback(false);
};

const checkMessageLength = (message, length, callback) => {
	if(message.length >= length)
		callback(true);
	else
		callback(false);
};

const checkOriginChannel = (origin_channel, settings_channel, callback) => {
	if(origin_channel.name ==settings_channel)
		callback(true);
	else
		callback(false);
};

const checkIfInLabels = (labels, label, callback) => {
	if(labels.hasOwnProperty(label))
		callback(true);
	else
		callback(false);
};

const bestParser = callback => {
	const htmlparser = require("htmlparser2");
	const parser = new htmlparser.Parser({
		ontext(text) {
			if(text.substring(0,3) == "Dio")
				callback(text);
			}
	});
	const request = require('request');
	request('http://teknoraver.net/bestemmiatore/', (error, response, body) => {
	  if (!error && response.statusCode == 200) {
	  	parser.write(body);
	    parser.end();
	  }
	});
};



const settings = readSettings();
const labels = readLabels();

import Discordie from "discordie";
const client = new Discordie();

client.connect({
  // replace this sample token
  token: settings['token']
});

client.Dispatcher.on("GATEWAY_READY", e => {
  console.log(`Connected as: ${client.User.username}`);
  console.log("Set the played game of 'L'undicesimo comandamento'");
  client.User.setGame("L'undicesimo comandamento");
  console.log(`The current channel designed for torrent related commands is: ${settings['torrent_channel']}`);
  console.log(`The role to execute torrent related commands is: ${settings['torrent_role']}`);
});

client.Dispatcher.on("MESSAGE_CREATE", e => {
	if(e.message.content.split(' ')[0] == '!bestemmia')
		bestParser(text => {
			if(text != undefined)
				e.message.channel.sendMessage(`\`${text}\``);
			});
	checkRoles(e.message.author.memberOf(e.message.guild).roles, settings['torrent_role'], roles_condition => {
		if(roles_condition) {
			const message = e.message.content.split(' ');
			switch(message[0]) {
				// ###############################################################
				// ###############################################################
				// ###############################################################
				// ###############################################################
				// Block of cases for torrents
				// ###############################################################
				// ###############################################################
				// ###############################################################
				// ###############################################################
				case '!checkperm':
					e.message.channel.sendMessage(`${e.message.author.mention}: Fai parte del ruolo ${settings['torrent_role']}`);
					break;
				case '!setchannel':
					checkSettingsChannel(settings, channel_settings_condition => {
						if(channel_settings_condition) {
							checkMessageLength(message, 2, length_condition => {
								if(length_condition) {
									checkChannels(e.message.guild.channels, message[1], '0', channel_condition => {
										if(channel_condition) {
											settings['torrent_channel'] = message[1];
											e.message.channel.sendMessage(`${e.message.author.mention}: Hai impostato con successo il canale **${message[1]}** come predefinito per i torrent!`);
											writeSettings(settings);
										}
										else 
											e.message.channel.sendMessage(`${e.message.author.mention}: Il canale **${message[1]}** non esiste!`);
									});
								} 
								else 
									e.message.channel.sendMessage(`${e.message.author.mention}: Devi fornire un nome di un canale testuale insieme al comando!`);
							});
						}
						else {
							e.message.channel.sendMessage(`${e.message.author.mention}: Hai cancellato con successo il canale **${settings['torrent_channel']}** come predefinito per i torrent!`);
							settings['torrent_channel'] = 'none';
							writeSettings(settings);
						}
					});
					break;
				case '!labels':
					checkSettingsChannel(settings, channel_settings_condition => {
						if(channel_settings_condition) 
							e.message.channel.sendMessage(`${e.message.author.mention}: Non hai ancora eseguito il comando **!setchannel**!`);
						else
							{
								checkOriginChannel(e.message.channel, settings['torrent_channel'], origin_condition => {
									if(origin_condition)
										{
											let big_message = `${e.message.author.mention}: Ecco le labels che hai a disposizione:\n\n\`\`\``;
											Object.keys(labels).forEach(label => {
												big_message += `${label}\n`;
											});
											big_message += '```'
											e.message.channel.sendMessage(big_message);
										}
									});
							}
					});
					break;
				case '!addurl':
					checkSettingsChannel(settings, channel_settings_condition => {
						if(channel_settings_condition) 
							e.message.channel.sendMessage(`${e.message.author.mention}: Non hai ancora eseguito il comando **!setchannel**!`);
						else
							{
								checkOriginChannel(e.message.channel, settings['torrent_channel'], origin_condition => {
									if(origin_condition)
										checkMessageLength(message, 3, length_condition => {
											if(length_condition) {
												checkIfInLabels(labels, message[2], labels_condition => {
													if(labels_condition) {
														const deluge = require('deluge')(settings['delugeUrl'], settings['delugePassword']);
														deluge.add(message[1], labels[message[2]], (error, result) => {
															if(error) {
																e.message.channel.sendMessage(`${e.message.author.mention}: Non è stato possibile aggiungere il torrent!`);
															}
															else {
																console.log(result);
																const magnet = require('magnet-uri');
																const parsed = magnet.decode(message[1]);
																const log_string = `${e.message.author.username} ha aggiunto il torrent ${parsed.dn}`;
																console.log(log_string);
																const big_message = `${e.message.author.mention}: È stato aggiunto il torrent con magnet\n\n\`\`\`${message[1]}\`\`\`\ncon titolo **${parsed.dn}** con successo!`;
																e.message.channel.sendMessage(big_message);
															}
														});

													}
													else
														console.log(`Errore: Non c'è la label! ${message[2]}`);

												});
											}
											else {
												const big_message = `${e.message.author.mention}: Per utilizzare questo comando, devi seguire questa sintassi:\n\`!addurl url label\`\ndove:\n**url** è il magnet o il link diretto al torrent desiderato\n**label** è una delle label predefinite, ottenibili tramite il comando \`!labels\``;
												e.message.channel.sendMessage(big_message);
											}
											
								});
							});
						}
					});
					break;
				// ###############################################################
				// ###############################################################
				// ###############################################################
				// ###############################################################
				// End of block of cases for torrents
				// ###############################################################
				// ###############################################################
				// ###############################################################
				// ###############################################################
		    	default: 
		    		break;
			}
		}
	});
});

import express from 'express';
const app = express();
app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'pug');
app.use('/public', express.static(`${__dirname}/../public`));

app.get('/', (request, response) => {
	const time_b = new Date();
	const current_time = `${time_b.getHours()}:${time_b.getMinutes()}:${time_b.getSeconds()}`;
	response.render('index', 
		{ 
			title: 'Legionary',
			message_a: 'A small Discord bot to manage a Deluge torrent server. Written in NodeJS!',
			message_b: commands_runned,
			message_c: time_executed,
			message_d: current_time
		});
});

app.listen(app.get('port'), () => {
  console.log(`Node app is running at localhost:${app.get('port')}`);
});
