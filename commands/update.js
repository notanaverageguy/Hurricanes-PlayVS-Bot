const { SlashCommandBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('update')
		.setDescription('Responds with Pong!')
		.addStringOption(option =>
			option.setName('category')
				.setDescription('Bone, IC, Beginner, Intermediate, Expert')
				.setRequired(true)
				.addChoices(
					{ name: 'Bone Dungeon', value: 'bone' },
					{ name: 'Colony', value: 'ic' },
					{ name: 'Beginner Dungeon', value: 'beginner' },
					{ name: 'Intermediate Dungeon', value: 'intermediate' },
					{ name: 'Expert Dungeon', value: 'expert' },
				))
		.addIntegerOption(option =>
			option.setName('amount')
				.setDescription('What to set it as')
				.setRequired(true)),

	args: ["client", "connection"],
	
	async execute(interaction, args) {
		const catagory = (interaction.options["_hoistedOptions"][0].value).toLowerCase();
		const amount = interaction.options["_hoistedOptions"][1].value;
		if(!["bone", "ic", "expert", "intermediate", "beginner"].includes(catagory)) 
			return await interaction.reply({ content: `Please select a valid catagory (Bone, IC, Expert, Intermediate, Beginner)`, ephemeral: true});

		const interactionUser = await interaction.guild.members.fetch(interaction.user.id)
		const userName = interactionUser.user.username
		const userId = interactionUser.id
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
		const { ic, bone, expert, intermediate, beginner, channel} = require("../config.json");

		executeQuery(`SELECT * FROM people WHERE UUID="${userId}"`)
		.then((results) => {
			if (results[0] == undefined) return executeQuery(`INSERT INTO people VALUES(${userId}, "${userName}", 0, 0, 0, 0, 0, true);`);
		})
		.then(() => { return executeQuery(`UPDATE people SET ${catagory} = ${amount} WHERE UUID = ${userId};`); })
		.then(() => {
			switch (catagory) {
				case "ic":
					executeQuery(`SELECT visible, ic, username FROM people ORDER BY ic DESC LIMIT 10`)
					.then((results) => {
						const messageToSend = `**Colony King Leaderboard** \n${ results.map((obj, index) => `${index + 1} ${obj.username} **${index > 0 || obj.visible ? obj.ic : "REDACTED"}**`).join('\n') }`;
						client.channels.cache.get(channel).messages.fetch({ around: ic, limit: 1, force: true }).then((messages) => {const message = messages.first(); message.edit(messageToSend)
						})
					})
					break;
				case "bone":
					executeQuery(`SELECT visible, bone, username FROM people ORDER BY ic DESC LIMIT 10`)
					.then((results) => {
						const messageToSend = `**Dragon King Leaderboard** \n${ results.map((obj, index) => `${index + 1} ${obj.username} **${index > 0 || obj.visible ? obj.bone : "REDACTED"}**`).join('\n') }`
						client.channels.cache.get(channel).messages.fetch({ around: bone, limit: 1, force: true }).then((messages) => {const message = messages.first();message.edit(messageToSend)
						})
					})
					break;
				case "expert":
					executeQuery(`SELECT visible, expert, username FROM people ORDER BY ic DESC LIMIT 10`)
					.then((results) => {
						const messageToSend = `**Expert Dungeon King Leaderboard** \n${ results.map((obj, index) => `${index + 1} ${obj.username} **${index > 0 || obj.visible ? obj.expert : "REDACTED"}**`).join('\n') }`
						client.channels.cache.get(channel).messages.fetch({ around: expert, limit: 1, force: true }).then((messages) => {const message = messages.first();message.edit(messageToSend)
						})
					})
					break;
				case "intermediate":
					executeQuery(`SELECT visible, intermediate, username FROM people ORDER BY ic DESC LIMIT 10`)
					.then((results) => {
						const messageToSend = `**Intermediate Dungeon King Leaderboard** \n${ results.map((obj, index) => `${index + 1} ${obj.username} **${index > 0 || obj.visible ? obj.intermediate : "REDACTED"}**`).join('\n') }`
						client.channels.cache.get(channel).messages.fetch({ around: intermediate, limit: 1, force: true }).then((messages) => {const message = messages.first();message.edit(messageToSend)
						})
					})
					break;
				case "beginner":
					executeQuery(`SELECT visible, beginner, username FROM people ORDER BY ic DESC LIMIT 10`)
					.then((results) => {
						const messageToSend = `**Beginner Dungeon King Leaderboard** \n${ results.map((obj, index) => `${index + 1} ${obj.username} **${index > 0 || obj.visible ? obj.beginner : "REDACTED"}**`).join('\n') }`
						client.channels.cache.get(channel).messages.fetch({ around: beginner, limit: 1, force: true }).then((messages) => {const message = messages.first();message.edit(messageToSend)
						})
					})
					break;
			}
		})
		.catch((error) => { console.log(error); });
		await interaction.reply({ content: `Updated your profile`, ephemeral: true});
	},
};
