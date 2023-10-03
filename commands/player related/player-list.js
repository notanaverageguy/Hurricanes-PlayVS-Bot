const {
	SlashCommandBuilder,
	PermissionsBitField,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");

const { db, findPlayer } = require("../../libs/database.js");
const { upperCaseEveryWord, getTeamName } = require("../../libs/utils.js");
const config = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("player-list")
		.setDescription("Gets all players")
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
		var playerList = await db.collection("Players").getList(page, 9, {
			sort: "team,role",
		});
		const exampleEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Players on the Hurricanes Team")
			.setAuthor({
				name: config.embeds.author.name,
				iconURL: config.embeds.author.iconURL,
				url: config.embeds.author.url,
			})
			.setFooter({
				text: `Page ${page} out of ${playerList.totalPages}`,
			});

		for (const player of playerList.items) {
			const team = await db.collection("Teams").getOne(player.team);
			exampleEmbed.addFields({
				name: `${player.first_name} ${player.last_name}`,
				value: `\`ID: ${player.id}\`\n**Team:** ${team.name}\n**Role:** ${player.role}`,
				inline: true,
			});
		}

		interaction.reply({ embeds: [exampleEmbed] });
	},
};
