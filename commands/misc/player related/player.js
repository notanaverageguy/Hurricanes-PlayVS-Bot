const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { db, findPlayer, calcPlayerWins } = require("../../../libs/database.js");

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
				.setRequired(true)
		),

	args: [],
	user_permissions: [],
	bot_permissions: [],

	async execute(interaction) {
		const search = interaction.options.getString("search");
		const players = await db.collection("Players").getFullList({
			filter: `id = "${search}" || first_name = "${search}" || last_name = "${search}" || (first_name = "${
				search.split(" ")[0]
			}" && last_name = "${search.split(" ")[1]}")`,
		});

		if (!players.length)
			return interaction.reply({
				content: `No player found with search ${search}`,
				ephemeral: true,
			});

		const embeds = [];
		for (var player of players) {
			player = await calcPlayerWins(player.id);
			const team = await db.collection("Teams").getOne(player.team);
			const embed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(`Stats for ${player.first_name}`)
				.setAuthor({
					name: "Bot made by Naag",
					iconURL:
						"https://cdn.discordapp.com/avatars/952239410055888916/48e9b5fcc52babe9ad6e68d49dad124c.webp",
					url: "https://discord.js.org",
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
