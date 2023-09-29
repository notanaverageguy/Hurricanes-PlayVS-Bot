const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { db } = require("../libs/database");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("player")
		.setDescription("Gets stats of a single player")
		.addStringOption((option) =>
			option
				.setName("firstname")
				.setDescription("That player to get stats of")
				.setRequired(true)
		),

	args: [],
	permissions: [],

	async execute(interaction) {
		var target = interaction.options.getString("firstname");
		target = target.toLowerCase();
		target = target.charAt(0).toUpperCase() + target.slice(1);

		var player;
		try {
			player = await db
				.collection("Players")
				.getFirstListItem(`first_name = '${target}'`, (options = {}));
		} catch (ClientResponseError) {
			return interaction.reply("Player doesn't exist");
		}

		const team = await db.collection("Teams").getOne(player.team);

		const exampleEmbed = new EmbedBuilder()
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

		interaction.reply({ embeds: [exampleEmbed] });
	},
};
