const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { db } = require("../../libs/database.js");
const { upperCaseEveryWord } = require("../../libs/utils.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("gamelist")
		.setDescription("Gets all games")
		.addIntegerOption((option) =>
			option
				.setName("page")
				.setDescription("Page of matches to display ")
				.setRequired(false)
		),

	args: [],
	permissions: [],

	async execute(interaction) {
		var gameList = await db.collection("Games").getList(1, 9, {
			sort: "played",
		});
		const exampleEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Game history of the Hurricanes League")
			.setAuthor({
				name: "Bot made by Naag",
				iconURL:
					"https://cdn.discordapp.com/avatars/952239410055888916/48e9b5fcc52babe9ad6e68d49dad124c.webp",
				url: "https://discord.js.org",
			});

		for (const game of gameList.items) {
			const team = await db.collection("Teams").getOne(game.team);
			exampleEmbed.addFields({
				name: `vs. ${upperCaseEveryWord(game.opponent)}`,
				value: `\`ID: ${game.id}\`\n**Team:** ${
					team.name
				}\n**Score:** ${game.score}\n**Date:** ${
					game.played.split(" ")[0]
				}`,
				inline: true,
			});
		}

		interaction.reply({ embeds: [exampleEmbed] });
	},
};
