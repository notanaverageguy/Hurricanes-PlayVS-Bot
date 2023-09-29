const { SlashCommandBuilder } = require('discord.js');
const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Sends messages to track stats'),
		
	args: ["client", "connection"],
    permissions: [PermissionsBitField.Flags.Administrator],

	async execute(interaction, args) {
		const channelId = interaction.channelId;
		const client = args[0];
		const connection = args[1];
		
		function executeQuery(query) {
			return new Promise((resolve, reject) => {
				connection.query(query, function (error, results, fields) {
					if (error) {
						reject(error);
					} else {
						resolve(results);
					}
				});
			});
		}
		var config = require("../config.json");
		(async () => {
			try {
				if(config.ic.length > 0) {
					client.channels.cache.get(config.channel).messages.fetch({ around: config.ic, limit: 1, force: true }).then((messages) => {
						const message = messages.first(); message.delete();})
				}

				const icResults = await executeQuery(`SELECT visible, ic, username FROM people ORDER BY ic DESC LIMIT 10`);
				const icMessage = `**Colony King Leaderboard** \n${icResults.map((obj, index) => `${index + 1} ${obj.username} **${index > 0 || obj.visible? obj.ic : "REDACTED"}**`).join('\n')}`;
				const icSentMessage = await client.channels.cache.get(channelId).send(icMessage);
				config.ic = icSentMessage.id;

				if(config.bone.length > 0) {
					client.channels.cache.get(config.channel).messages.fetch({ around: config.bone, limit: 1, force: true }).then((messages) => {
						const message = messages.first(); message.delete();})
				}
			
				const boneResults = await executeQuery(`SELECT visible, bone, username FROM people ORDER BY bone DESC LIMIT 10`);
				const boneMessage = `**Dragon King Leaderboard** \n${boneResults.map((obj, index) => `${index + 1} ${obj.username} **${index > 0 || obj.visible? obj.bone : "REDACTED"}**`).join('\n')}`;
				const boneSentMessage = await client.channels.cache.get(channelId).send(boneMessage);
				config.bone = boneSentMessage.id;

				if(config.beginner.length > 0) {
					client.channels.cache.get(config.channel).messages.fetch({ around: config.beginner, limit: 1, force: true }).then((messages) => {
						const message = messages.first(); message.delete();})
				}
			
				const beginnerResults = await executeQuery(`SELECT visible, beginner, username FROM people ORDER BY beginner DESC LIMIT 10`);
				const beginnerMessage = `**Beginner Dungeon King Leaderboard** \n${beginnerResults.map((obj, index) => `${index + 1} ${obj.username} **${index > 0 || obj.visible? obj.beginner : "REDACTED"}**`).join('\n')}`;
				const beginnerSentMessage = await client.channels.cache.get(channelId).send(beginnerMessage);
				config.beginner = beginnerSentMessage.id;

				if(config.intermediate.length > 0) {
					client.channels.cache.get(config.channel).messages.fetch({ around: config.intermediate, limit: 1, force: true }).then((messages) => {
						const message = messages.first(); message.delete();})
				}
			
				const intermediateResults = await executeQuery(`SELECT visible, intermediate, username FROM people ORDER BY intermediate DESC LIMIT 10`);
				const intermediateMessage = `**Intermediate Dungeon King Leaderboard** \n${intermediateResults.map((obj, index) => `${index + 1} ${obj.username} **${index > 0 || obj.visible? obj.intermediate : "REDACTED"}**`).join('\n')}`;
				const intermediateSentMessage = await client.channels.cache.get(channelId).send(intermediateMessage);
				config.intermediate = intermediateSentMessage.id;

				if(config.expert.length > 0) {
					client.channels.cache.get(config.channel).messages.fetch({ around: config.expert, limit: 1, force: true }).then((messages) => {
						const message = messages.first(); message.delete();})
				}
			
				const expertResults = await executeQuery(`SELECT visible, expert, username FROM people ORDER BY expert DESC LIMIT 10`);
				const expertMessage = `**Expert Dungeon King Leaderboard** \n${expertResults.map((obj, index) => `${index + 1} ${obj.username} **${index > 0 || obj.visible? obj.expert : "REDACTED"}**`).join('\n')}`;
				const expertSentMessage = await client.channels.cache.get(channelId).send(expertMessage);
				config.expert = expertSentMessage.id;
			
				config.channel = channelId;
				config.guild = interaction.guildId;
				fs.writeFileSync('./bots/leaderboard bot/config.json', JSON.stringify(config, null, 2));
				interaction.reply({ content: `Started Successfully`, ephemeral: true });
			} catch (error) {
			  console.error(error);
			}
		  })();
	},
};