const {
	SlashCommandBuilder,
	PermissionsBitField,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");

const { db, findPlayer, calcGameScore } = require("../../libs/database.js");
const { upperCaseEveryWord, getTeamName } = require("../../libs/utils.js");
const config = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("game-list")
		.setDescription("Gets all games")
		.addIntegerOption((option) =>
			option
				.setName("page")
				.setDescription("Page of matches to display ")
				.setRequired(false)
		),

	args: [],
	user_permissions: [],
	bot_permissions: [],

	async execute(interaction) {
		const page = interaction.options.getInteger("page") ?? 1;
		var gameList = await db.collection("Games").getList(page, 9, {
			sort: "played",
		});
		const exampleEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Game history of the Hurricanes League")
			.setAuthor({
				name: config.embeds.author.name,
				iconURL: config.embeds.author.iconURL,
				url: config.embeds.author.url,
			})
			.setFooter({ text: `Page ${page} out of ${gameList.totalPages}` });

		for (var game of gameList.items) {
			game = await calcGameScore(game.id);
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

		interaction.reply({ embeds: [exampleEmbed], ephemeral: true });
	},
};
