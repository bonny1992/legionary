'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _ping = require('ping');

var _ping2 = _interopRequireDefault(_ping);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _unirest = require('unirest');

var _unirest2 = _interopRequireDefault(_unirest);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _discordie = require('discordie');

var _discordie2 = _interopRequireDefault(_discordie);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var commands_runned = 0;
var time = new Date();
var time_executed = time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds();
var timer = void 0;

var KeepAlive = function KeepAlive() {
	var host = 'www.google.com';
	_ping2.default.sys.probe(host, function (isAlive) {
		var currentdate = new Date();
		var datetime = 'KeepAlive: ' + currentdate.getDate() + '/' + (currentdate.getMonth() + 1) + '/' + currentdate.getFullYear() + ' @ ' + currentdate.getHours() + ':' + currentdate.getMinutes() + ':' + currentdate.getSeconds();
		console.log(datetime);
	});
};

var readSettings = function readSettings() {
	var jsonfile = require('jsonfile');
	var path = 'config.json';
	try {
		_fs2.default.accessSync(path, _fs2.default.F_OK);
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

var readLabels = function readLabels() {
	var jsonfile = require('jsonfile');
	var path = 'labels.json';
	try {
		_fs2.default.accessSync(path, _fs2.default.F_OK);
		var settings = jsonfile.readFileSync(path);
		return settings;
	} catch (e) {
		var settings = null;
		return settings;
	}
};

var writeSettings = function writeSettings(settings) {
	var jsonfile = require('jsonfile');
	var file = './config.json';
	var obj = settings;
	jsonfile.writeFileSync(file, obj);
};

var checkChannels = function checkChannels(channels, desired_channel, channel_type, callback) {
	var channel_type = channel_type || '0';
	channels.forEach(function (channel, index, array) {
		if (channel.name == desired_channel && channel.type == channel_type) {
			callback(true);
		}
	});
};

var checkRoles = function checkRoles(roles, desired_role, callback) {
	roles.forEach(function (role, index, array) {
		if (role.name == desired_role) {
			callback(true);
		}
	});
};

var checkSettingsChannel = function checkSettingsChannel(settings, callback) {
	if (settings['torrent_channel'] == 'none') callback(true);else callback(false);
};

var checkMessageLength = function checkMessageLength(message, length, callback) {
	if (message.length >= length) callback(true);else callback(false);
};

var checkOriginChannel = function checkOriginChannel(origin_channel, settings_channel, callback) {
	if (origin_channel.name == settings_channel) callback(true);else callback(false);
};

var checkIfInLabels = function checkIfInLabels(labels, label, callback) {
	if (labels.hasOwnProperty(label)) callback(true);else callback(false);
};

var bestParser = function bestParser(callback) {
	var htmlparser = require("htmlparser2");
	var parser = new htmlparser.Parser({
		ontext: function ontext(text) {
			if (text.substring(0, 3) == "Dio") callback(text);
		}
	});
	var request = require('request');
	request('http://teknoraver.net/bestemmiatore/', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			parser.write(body);
			parser.end();
		}
	});
};

var download = function download(uri, filename, callback) {
	_request2.default.head(uri, function (err, res, body) {
		(0, _request2.default)(uri).pipe(_fs2.default.createWriteStream('./img_temp/' + filename)).on('close', callback);
	});
};

var hsParser = function hsParser(cardname, callback) {
	console.log('GET https://omgvamp-hearthstone-v1.p.mashape.com/cards/search/' + cardname + '?locale=itIT&collectible=1');
	_unirest2.default.get('https://omgvamp-hearthstone-v1.p.mashape.com/cards/search/' + cardname + '?locale=itIT&collectible=1').header("X-Mashape-Key", "QNONu0GxUCmshtEPsWRc3xvZ2EYup11KhpejsnUWCeuk7rphhd").end(function (result) {
		if (result.status != '200') callback(false, false);else {
			callback(true, result.body);
		}
	});
};

var filedelete = function filedelete(imagepath) {
	var sleep = require('sleep-async')();
	sleep.sleep(120000, function () {
		_fs2.default.unlink(imagepath, function (error) {
			if (error) {
				console.log('Impossibile eliminare ' + imagepath);
			} else console.log('DELETED ' + imagepath);
		});
	});
};

var settings = readSettings();
var labels = readLabels();

var client = new _discordie2.default();

client.connect({
	// replace this sample token
	token: settings['token']
});

client.Dispatcher.on("GATEWAY_READY", function (e) {
	console.log('Connected as: ' + client.User.username);
	console.log("Set the played game of 'L'undicesimo comandamento'");
	client.User.setGame("L'undicesimo comandamento");
	console.log('The current channel designed for torrent related commands is: ' + settings['torrent_channel']);
	console.log('The role to execute torrent related commands is: ' + settings['torrent_role']);
});

client.Dispatcher.on("MESSAGE_CREATE", function (e) {
	if (e.message.content.split(' ')[0] == '!dio') bestParser(function (text) {
		if (text != undefined) e.message.channel.sendMessage('`' + text + '`');
	});else if (e.message.content.split(' ')[0] == '!keepalive') {
		if (timer) {
			clearTimeout(timer);
			timer = "";
			e.message.channel.sendMessage(e.message.author.mention + ': Hai disattivato con successo il comando di `keepalive`!');
			console.log('Log: Keepalive disabled');
		} else {
			timer = setTimeout(function () {
				KeepAlive();
			}, 600000);
			e.message.channel.sendMessage(e.message.author.mention + ': Hai attivato con successo il comando di `keepalive`, che **dovrebbe** mantenere acceso il bot su Heroku!');
			var milliseconds = new Date(600000);
			console.log('Log: Keepalive enabled | ' + milliseconds.getMinutes() + ' m');
		}
	} else if (e.message.content.split(' ')[0] == '!hs') {
		if (e.message.content.split(' ').length == 1) {
			var only_one_command = e.message.author.mention + ': Per utilizzare questo comando, devi seguire questa sintassi:\n`!hs card name`\ndove:\n**card name** è il nome della carta che vuoi cercare!';
			e.message.channel.sendMessage(only_one_command);
		} else {
			var parameter = "";
			if (e.message.content.split(' ').length > 2) {
				for (var i = 1; i < e.message.content.split(' ').length; i++) {
					parameter += e.message.content.split(' ')[i] + '%20';
				}parameter = parameter.substring(0, parameter.length - 3);
			} else parameter = e.message.content.split(' ')[1];
			hsParser(parameter, function (found, response) {
				parameter = parameter.replace(/%20/g, ' ');
				if (found) {
					var message = "";
					var img = void 0;
					if (response.length > 1) message = e.message.author.mention + ': Sono stati trovati `' + response.length + '` risultati per la chiave di ricerca `' + parameter + '`.\n';else message = e.message.author.mention + ': È stato trovato `' + response.length + '` risultato per la chiave di ricerca `' + parameter + '`.\n';
					var _i = 0;
					response.forEach(function (instance) {
						if (instance.hasOwnProperty('img')) {
							img = instance.img;
							return;
						}
					});
					if (img != undefined) {
						(function () {
							var filename = _path2.default.basename(_url2.default.parse(img).pathname);
							download(img, filename, function () {
								e.message.channel.uploadFile('./img_temp/' + filename, filename, message);
								if (response.length > 1 && response.length < 51) {
									var other_cards = 'Tutti i risultati: \n```';
									response.forEach(function (card) {
										other_cards += card.name + '\n';
									});
									other_cards += '```';
									e.message.channel.sendMessage(other_cards);
									var ms = new Date(120000);
									console.log('PENDING DELETION ./img_temp/' + filename + ' (' + ms.getMinutes() + ' min)');
									filedelete('./img_temp/' + filename);
								} else if (response.length > 50) {
									var _other_cards = 'Troppi risultati per visualizzarne una lista!';
									e.message.channel.sendMessage(_other_cards);
								}
							});
						})();
					} else {
						var message = e.message.author.mention + ': Non sono state trovate immagini per la chiave di ricerca `' + parameter + '`.\n';
						e.message.channel.sendMessage(message);
					}
				} else {
					var message = e.message.author.mention + ': Sono stati trovati `0` risultati per la chiave di ricerca `' + parameter + '`.\n';
					e.message.channel.sendMessage(message);
				}
			});
		}
	}

	checkRoles(e.message.author.memberOf(e.message.guild).roles, settings['torrent_role'], function (roles_condition) {
		if (roles_condition) {
			(function () {
				var message = e.message.content.split(' ');
				switch (message[0]) {
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
						e.message.channel.sendMessage(e.message.author.mention + ': Fai parte del ruolo ' + settings['torrent_role']);
						break;
					case '!setchannel':
						checkSettingsChannel(settings, function (channel_settings_condition) {
							if (channel_settings_condition) {
								checkMessageLength(message, 2, function (length_condition) {
									if (length_condition) {
										checkChannels(e.message.guild.channels, message[1], '0', function (channel_condition) {
											if (channel_condition) {
												settings['torrent_channel'] = message[1];
												e.message.channel.sendMessage(e.message.author.mention + ': Hai impostato con successo il canale **' + message[1] + '** come predefinito per i torrent!');
												writeSettings(settings);
											} else e.message.channel.sendMessage(e.message.author.mention + ': Il canale **' + message[1] + '** non esiste!');
										});
									} else e.message.channel.sendMessage(e.message.author.mention + ': Devi fornire un nome di un canale testuale insieme al comando!');
								});
							} else {
								e.message.channel.sendMessage(e.message.author.mention + ': Hai cancellato con successo il canale **' + settings['torrent_channel'] + '** come predefinito per i torrent!');
								settings['torrent_channel'] = 'none';
								writeSettings(settings);
							}
						});
						break;
					case '!labels':
						checkSettingsChannel(settings, function (channel_settings_condition) {
							if (channel_settings_condition) e.message.channel.sendMessage(e.message.author.mention + ': Non hai ancora eseguito il comando **!setchannel**!');else {
								checkOriginChannel(e.message.channel, settings['torrent_channel'], function (origin_condition) {
									if (origin_condition) {
										var big_message = e.message.author.mention + ': Ecco le labels che hai a disposizione:\n\n```';
										Object.keys(labels).forEach(function (label) {
											big_message += label + '\n';
										});
										big_message += '```';
										e.message.channel.sendMessage(big_message);
									}
								});
							}
						});
						break;
					case '!addurl':
						checkSettingsChannel(settings, function (channel_settings_condition) {
							if (channel_settings_condition) e.message.channel.sendMessage(e.message.author.mention + ': Non hai ancora eseguito il comando **!setchannel**!');else {
								checkOriginChannel(e.message.channel, settings['torrent_channel'], function (origin_condition) {
									if (origin_condition) checkMessageLength(message, 3, function (length_condition) {
										if (length_condition) {
											checkIfInLabels(labels, message[2], function (labels_condition) {
												if (labels_condition) {
													var deluge = require('deluge')(settings['delugeUrl'], settings['delugePassword']);
													deluge.add(message[1], labels[message[2]], function (error, result) {
														if (error) {
															e.message.channel.sendMessage(e.message.author.mention + ': Non è stato possibile aggiungere il torrent!');
														} else {
															var magnet = require('magnet-uri');
															var parsed = magnet.decode(message[1]);
															var log_string = e.message.author.username + ' ha aggiunto il torrent ' + parsed.dn;
															_fs2.default.appendFileSync('public/logs.html', '<p>' + log_string + '<p><br />');
															console.log(log_string);
															var big_message = e.message.author.mention + ': È stato aggiunto il torrent con magnet\n\n```' + message[1] + '```\ncon titolo **' + parsed.dn + '** con successo!';
															e.message.channel.sendMessage(big_message);
														}
													});
												} else console.log('Errore: Non c\'è la label! ' + message[2]);
											});
										} else {
											var big_message = e.message.author.mention + ': Per utilizzare questo comando, devi seguire questa sintassi:\n`!addurl url label`\ndove:\n**url** è il magnet o il link diretto al torrent desiderato\n**label** è una delle label predefinite, ottenibili tramite il comando `!labels`';
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
			})();
		}
	});
});

var app = (0, _express2.default)();
app.set('port', process.env.PORT || 5000);
app.set('view engine', 'pug');
app.use('/public', _express2.default.static(__dirname + '/../public'));

app.get('/', function (request, response) {
	var time_b = new Date();
	var current_time = time_b.getHours() + ':' + time_b.getMinutes() + ':' + time_b.getSeconds();
	response.render('index', {
		title: 'Legionary',
		message_a: 'A small Discord bot to manage a Deluge torrent server. Written in NodeJS!',
		message_b: commands_runned,
		message_c: time_executed,
		message_d: current_time
	});
});

app.listen(app.get('port'), function () {
	console.log('Node app is running at localhost:' + app.get('port'));
});