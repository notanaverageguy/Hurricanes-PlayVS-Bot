const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { db, findPlayer, calcPlayerWins } = require("../../libs/database.js");
const config = require('../../config.json');
module.exports = {
	data: new SlashCommandBuilder()
		.setName("player")
		.setDescription("Gets stats of a single player")
		.addStringOption((option) =>
			option
				.setName("search")
				.setDescription(
					"Can search by id, first name, last name, first and last name"
				)
				.setRequired(false)
		),

	args: [],
	user_permissions: [],
	bot_permissions: [],

	async execute(interaction) {
		const search = interaction.options.getString("search");

		var players;
		if (search == null) {
			var player = await db
				.collection("Players")
				.getFirstListItem(`discord_id = '${interaction.user.id}'`)
				.catch(() => {
					return null;
				});

			if (player == null) {
				return interaction.reply({
					content: "Accont not linked to a player",
					ephemeral: true,
				});
			}

			players = [player];
		} else {
			players = await db.collection("Players").getFullList({
				filter: `id = "${search}" || first_name = "${search}" || last_name = "${search}" || (first_name = "${
					search.split(" ")[0]
				}" && last_name = "${search.split(" ")[1]}")`,
			});

			if (!players.length)
			return interaction.reply({
				content: `No player found with search ${search}`,
				ephemeral: true,
			});

		}

		const embeds = [];
		for (var player of players) {
			player = await calcPlayerWins(player.id);
			const team = await db.collection("Teams").getOne(player.team);
			const embed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(`Stats for ${player.first_name}`)
				.setAuthor({
					name: config.embeds.author.name,
					iconURL: config.embeds.author.iconURL,
					url: config.embeds.author.url,
				})
				.addFields(
					{ name: "Team", value: team.name, inline: true },
					{ name: "Role", value: player.role, inline: true },
					{ name: "\u200B", value: "\u200B", inline: true },
					{
						name: "Games Played",
						value: `${player.games_played}`,
						inline: true,
					},
					{
						name: "Games Won",
						value: `${player.games_won}`,
						inline: true,
					},
					{
						name: "Games Lost",
						value: `${player.games_lost}`,
						inline: true,
					}
				)
				.setFooter({
					text: `Player id: ${player.id}`,
				});
			embeds.push(embed);
		}

		if (embeds.length > 10)
			interaction.reply({
				content: `Too many people found with search ${search}`,
				ephemeral: true,
			});

		interaction.reply({
			content: `${
				embeds.length == 1
					? ""
					: `Found ${embeds.length} players using search ${search}`
			}`,
			embeds: embeds,
			ephemeral: true,
		});
	},
};
