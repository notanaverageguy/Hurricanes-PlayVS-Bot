const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { db } = require("../libs/database");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("history")
		.setDescription("Gets the game history of a player")
		.addStringOption((option) =>
			option
				.setName("firstname")
				.setDescription("That player to get history of")
				.setRequired(true)
		)
		.addIntegerOption((option) =>
			option
				.setName("page")
				.setDescription("Page of matches to display ")
				.setRequired(false)
		),

	args: [],
	permissions: [],

	async execute(interaction) {
		var target = interaction.options.getString("firstname");
		target = target.toLowerCase();
		target = target.charAt(0).toUpperCase() + target.slice(1);

		const page = interaction.options.getInteger("page") ?? 0;

		var player;
		try {
			player = await db
				.collection("Players")
				.getFirstListItem(`first_name = '${target}'`, (options = {}));
		} catch (ClientResponseError) {
			return interaction.reply("Player doesn't exist");
		}

		const team = await db.collection("Teams").getOne(player.team);
		var gameQuery = await db.collection("Games").getList(page, 10);

		var games = [];
		for (const game of gameQuery.items) {
			if (game.players.includes(player.id)) games.push(game);
		}

		const exampleEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle(`Game history for ${player.first_name}`)
			.setAuthor({
				name: "Bot made by Naag",
				iconURL:
					"https://cdn.discordapp.com/avatars/952239410055888916/48e9b5fcc52babe9ad6e68d49dad124c.webp",
				url: "https://discord.js.org",
			})
			.addFields({ name: "Team", value: team.name })
			.setFooter({
				text: `Showing page ${gameQuery.page} out of ${gameQuery.totalPages}`,
			});

		for (const game of games) {
			exampleEmbed.addFields({
				name: `${game.opponent} ( ${game.win ? "won" : "loss"} )`,
				value: `Total matches: ${game.total_matches}\nwon: ${game.wins} loses: ${game.losses}\nplayed: ${game.played}\nid: ${game.id}`,
			});
		}

		interaction.reply({ embeds: [exampleEmbed] });
	},
};
