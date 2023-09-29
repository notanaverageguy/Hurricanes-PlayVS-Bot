const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Shows user stats'),
	args: ["connection"],
	
	async execute(interaction, args) {
        const interactionUser = await interaction.guild.members.fetch(interaction.user.id)
		const nickName = interactionUser.nickname
		const userName = interactionUser.user.username
		const userId = interactionUser.id
        connection = args;


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
        executeQuery(`SELECT * FROM people WHERE UUID="${userId}"`)
		.then((results) => {
			if (results[0] == undefined) return executeQuery(`INSERT INTO people VALUES(${userId}, "${userName}", 0, 0, 0, 0, 0);`);
		})
		.then(() => { return executeQuery(`SELECT * FROM people WHERE UUID="${userId}"`); })
		.then((results) => {
            results = results[0];
            const bone = results["bone"];
            const beginner = results["beginner"];
            const intermediate = results["intermediate"];
            const expert = results["expert"];
            const ic = results["ic"];
            const player_embed = new EmbedBuilder()
            .setColor("0x00FFFF")
            .setTitle(`Stats for ${userName}`)
            .setAuthor({ name: 'Naag'})
            .addFields([
                { name: 'IC', value: `${ic}`, inline: true },
                { name: 'Bone Dragon', value: `${bone}`, inline: true },
                { name: 'Beginner', value: `${beginner}`, inline: true },
                { name: 'Intermediate', value: `${intermediate}`, inline: true },
                { name: 'Expert', value: `${expert}`, inline: true },   
            ])
            interaction.reply({embeds: [player_embed], ephemeral: true});
        })
		.catch((error) => { console.log(error); });
	},
};