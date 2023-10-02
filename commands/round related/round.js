const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { db } = require("../../libs/database.js");
const { upperCaseEveryWord } = require("../../libs/utils.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("round")
		.setDescription("Gets stats of a round")
		.addStringOption((option) =>
			option
				.setName("id")
				.setDescription("ID of the round")
				.setRequired(true)
		),

	args: [],
	user_permissions: [],
	bot_permissions: [],

	async execute(interaction) {
		const idSearch = interaction.options.getString("id");
		var round = await db
			.collection("Rounds")
			.getOne(idSearch)
			.catch(() => {
				return null;
			});
		if (!round)
			return interaction.reply(
				`No round found with ID '**${idSearch}**'`
			);

		const team = await db.collection("Teams").getOne(round.team);
		const embed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle(`vs. ${upperCaseEveryWord(round.opponent)}`)
			.setAuthor({
				name: "Bot made by Naag",
				iconURL:
					"https://cdn.discordapp.com/avatars/952239410055888916/48e9b5fcc52babe9ad6e68d49dad124c.webp",
				url: "https://discord.js.org",
			})
			.addFields(
				{ name: "Team", value: team.name, inline: true },
				{ name: "Score", value: round.score, inline: true },
				{
					name: "Round #",
					value: `${round.round}`,
					inline: true,
				}
			)
			.setFooter({
				text: `Round id: ${round.id}`,
			});


		// Getting players
		for (var player of round.players) {
			player = await db.collection("Players").getOne(player);
			embed.addFields({
				name: `**${upperCaseEveryWord(player.first_name)}**`,
				value: `${player.role}`,
				inline: true,
			});
		}

        embed.addFields({
            name: `**Date Time**`, value: `${round.played.split(" ")[0]} ${round.played.split(" ")[1].split(".")[0]}`
        })

		interaction.reply({ embeds: [embed] });
	},
};
