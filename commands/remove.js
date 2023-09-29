const { SlashCommandBuilder } = require('discord.js');
const { PermissionsBitField } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('removes a member')
        .addUserOption(option => option.setName('user').setDescription('The user to remove').setRequired(true)),
	args: ["client", "connection"],
    permissions: [PermissionsBitField.Flags.ModerateMembers],

	async execute(interaction, args) {
        const client = args[0];
		const connection = args[1];
		const userId = (interaction.options["_hoistedOptions"][0].value);
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
        (async () => {
        try {
            const deleted = await executeQuery(`DELETE FROM people WHERE UUID=${userId}`);
            
            await executeQuery(`SELECT visible, ic, username FROM people ORDER BY ic DESC LIMIT 10`)
            .then((results) => {
                const messageToSend = `**Colony King Leaderboard** \n${ results.map((obj, index) => `${index + 1} ${obj.username} **${index > 0 || obj.visible ? obj.ic : "REDACTED"}**`).join('\n') }`;
                client.channels.cache.get(channel).messages.fetch({ around: ic, limit: 1, force: true }).then((messages) => {const message = messages.first(); message.edit(messageToSend)
                })
            })
            
            await executeQuery(`SELECT visible, bone, username FROM people ORDER BY ic DESC LIMIT 10`)
            .then((results) => {
                const messageToSend = `**Dragon King Leaderboard** \n${ results.map((obj, index) => `${index + 1} ${obj.username} **${index > 0 || obj.visible ? obj.bone : "REDACTED"}**`).join('\n') }`
                client.channels.cache.get(channel).messages.fetch({ around: bone, limit: 1, force: true }).then((messages) => {const message = messages.first();message.edit(messageToSend)
                })
            })
        
            await executeQuery(`SELECT visible, beginner, username FROM people ORDER BY ic DESC LIMIT 10`)
            .then((results) => {
                const messageToSend = `**Beginner Dungeon King Leaderboard** \n${ results.map((obj, index) => `${index + 1} ${obj.username} **${index > 0 || obj.visible ? obj.beginner : "REDACTED"}**`).join('\n') }`
                client.channels.cache.get(channel).messages.fetch({ around: beginner, limit: 1, force: true }).then((messages) => {const message = messages.first();message.edit(messageToSend)
                })
            })

            await executeQuery(`SELECT visible, intermediate, username FROM people ORDER BY ic DESC LIMIT 10`)
            .then((results) => {
                const messageToSend = `**Intermediate Dungeon King Leaderboard** \n${ results.map((obj, index) => `${index + 1} ${obj.username} **${index > 0 || obj.visible ? obj.intermediate : "REDACTED"}**`).join('\n') }`
                client.channels.cache.get(channel).messages.fetch({ around: intermediate, limit: 1, force: true }).then((messages) => {const message = messages.first();message.edit(messageToSend)
                })
            })

            await executeQuery(`SELECT visible, expert, username FROM people ORDER BY ic DESC LIMIT 10`)
            .then((results) => {
                const messageToSend = `**Expert Dungeon King Leaderboard** \n${ results.map((obj, index) => `${index + 1} ${obj.username} **${index > 0 || obj.visible ? obj.expert : "REDACTED"}**`).join('\n') }`
                client.channels.cache.get(channel).messages.fetch({ around: expert, limit: 1, force: true }).then((messages) => {const message = messages.first();message.edit(messageToSend)
                })
            })
    
            await interaction.reply( {content: deleted.affectedRows ? `Successfully removed user` : `User not found but updated leaderboards`, ephemeral: true});
          } catch (error) {
            console.error(error);
          }
        })();
	},
};