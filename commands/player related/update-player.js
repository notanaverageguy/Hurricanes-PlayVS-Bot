const { SlashCommandBuilder } = require("discord.js");
const { PermissionsBitField } = require('discord.js');
const { db, findPlayer } = require("../../libs/database.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("update-player")
		.setDescription("Update a player's profile")
		.addStringOption((option) =>
			option
				.setName("search")
				.setDescription(
					"Can search by id, first name, last name, first and last name"
				)
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
	user_permissions: [],
	bot_permissions: [],

	async execute(interaction) {
		const search = interaction.options.getString("search");
		const first_name = interaction.options.getString("firstname");
		const last_name = interaction.options.getString("lastname");
		const team = interaction.options.getString("team");
		const role = interaction.options.getString("role");
		const won = interaction.options.getInteger("games_won");
		const lost = interaction.options.getInteger("games_lost");

		const player = await findPlayer(search);
		if (player == null)
			return interaction.reply(`No player found with search ${search}`);

		if (first_name != null) player.first_name = first_name;
		if (last_name != null) player.last_name = last_name;
		if (team != null) player.team = team;
		if (role != null) player.role = role;
		if (won != null) player.games_won = won;
		if (lost != null) player.games_lost = lost;

		player.games_played = player.games_won + player.games_lost;
		await db.collection("Players").update(playerID, player);
		interaction.reply(
			`Successfully updated player **${player.first_name}**`
		);
	},
};
