const { SlashCommandBuilder } = require("discord.js");
const { db } = require("../../libs/database");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("update-player")
		.setDescription("Update a player's profile")
		.addStringOption((option) =>
			option
				.setName("id")
				.setDescription("ID of player")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("firstname")
				.setDescription("First name of player")
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName("lastname")
				.setDescription("Last name of player")
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName("role")
				.setDescription("The player's role on the team")
				.setRequired(false)
				.addChoices(
					{ name: "Player", value: "Player" },
					{ name: "Sub", value: "Substitute" },
					{ name: "Captain", value: "Captian" }
				)
		)
		.addStringOption((option) =>
			option
				.setName("team")
				.setDescription("The team the player is on")
				.setRequired(false)
				.addChoices({ name: "Rocket League", value: "e8mjbfqf0ho1wz2" })
		)
		.addIntegerOption((option) =>
			option
				.setName("games_won")
				.setDescription("Number of games won")
				.setRequired(false)
		)
		.addIntegerOption((option) =>
			option
				.setName("games_lost")
				.setDescription("Number of games lost")
				.setRequired(false)
		),
	args: [],
	permissions: [],

	async execute(interaction) {
		let playerID = interaction.options.getString("id");
		var player = await db
			.collection("Players")
			.getOne(interaction.options.getString("id"))
			.catch(() => {
				interaction.reply(`No player found with ID '**${playerID}**'`);
			});

		if (interaction.options.getString("firstname") != null)
			player.first_name = interaction.options.getString("firstname");
		if (interaction.options.getString("lastname") != null)
			player.last_name = interaction.options.getString("lastname");
		if (interaction.options.getString("team") != null)
			player.team = interaction.options.getString("team");
		if (interaction.options.getString("role") != null)
			player.role = interaction.options.getString("role");
		if (interaction.options.getInteger("games_won") != null)
			player.games_won = interaction.options.getInteger("games_won");
		if (interaction.options.getInteger("games_lost") != null)
			player.games_lost = interaction.options.getInteger("games_lost");

		player.games_played = player.games_won + player.games_lost;
		await db.collection("Players").update(playerID, player);
		interaction.reply(
			`Successfully updated player **${player.first_name}**`
		);
	},
};
