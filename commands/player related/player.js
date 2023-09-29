const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { db } = require("../../libs/database");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("player")
		.setDescription("Gets stats of a single player")
		.addStringOption((option) =>
			option
				.setName("id")
				.setDescription("The ID of player to get stats of")
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName("firstname")
				.setDescription("The name of player to get stats of")
				.setRequired(false)
		),

	args: [],
	permissions: [],

	async execute(interaction) {
		const idSearch = interaction.options.getString("id");
		const nameSearch = interaction.options.getString("firstname");
		var player;

		if (idSearch != null) {
			player = await db
				.collection("Players")
				.getOne(interaction.options.getString("id"))
				.catch(() => {
					interaction.reply(
						`No player found with ID '**${idSearch}**'`
					);
				});
		} else if (nameSearch != null) {
			var target = interaction.options.getString("firstname");
			target = target.toLowerCase();
			target = target.charAt(0).toUpperCase() + target.slice(1);

			player = await db
				.collection("Players")
				.getFirstListItem(`first_name = '${target}'`, (options = {}))
				.catch(() => {
					interaction.reply(
						`No player found with first name '**${nameSearch}**'`
					);
				});
		} else {
			interaction.reply(
				`You must input either an *ID* or a *first name*`
			);
			return;
		}

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
				{ name: "\u200B", value: "\u200B" },
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

		interaction.reply({ embeds: [embed] });
	},
};
