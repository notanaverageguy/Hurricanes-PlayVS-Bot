const { SlashCommandBuilder } = require('discord.js');
const { PermissionsBitField } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Updates Settings')
    
    .addStringOption(option =>
        option.setName('username')
            .setDescription('Leaderboard name')
            .setRequired(false))

    .addStringOption(option =>
        option.setName('visible')
            .setDescription('Setting to update')
            .setRequired(false)
            .addChoices(
                { name: 'Hide', value: 'false' },
                { name: 'Show', value: 'true' }
            )),
		
	args: ["client", "connection"],
    permissions: [PermissionsBitField.Flags.Administrator],

	async execute(interaction, args) {
        const client = args[0];
		const connection = args[1];
		const interactionUser = await interaction.guild.members.fetch(interaction.user.id)
		const userId = interactionUser.id

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

        try{
            for(const setting of interaction.options["_hoistedOptions"]) {
                await executeQuery(`UPDATE people SET ${setting.name} = "${setting.value}" WHERE UUID = ${userId};`)
            }
            await interaction.reply({ content: `Updated your Settings`, ephemeral: true});
        } catch (error) {
          console.error(error);
        }

        const { ic, bone, expert, intermediate, beginner, channel} = require("../config.json");
        (async () => {
            try {
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
            } catch (error) {
                console.log(error)
            }
		  })();
	},
};