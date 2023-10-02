const { SlashCommandBuilder } = require("discord.js");
const { PermissionsBitField } = require('discord.js');
const { db } = require("../../libs/database.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("create-player")
		.setDescription("Creates a player's profile")
		.addStringOption((option) =>
			option
				.setName("firstname")
				.setDescription("First name of player")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("lastname")
				.setDescription("First name of player")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("role")
				.setDescription("The player's role on the team")
				.setRequired(true)
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
				.setRequired(true)
				.addChoices(
					{ name: "Super Smash Bros.", value: "lbvz4f8cs2cwgsg" },
					{ name: "Leauge of Legends", value: "v799hjxptlm89pi" },
					{ name: "Rocket League", value: "e8mjbfqf0ho1wz2" }
				)
		),
	args: [],
	user_permissions: [
		PermissionsBitField.Flags.ManageNicknames
	],
	bot_permissions: [],

	async execute(interaction) {
		const data = {
			first_name: interaction.options.getString("firstname"),
			last_name: interaction.options.getString("lastname"),
			role: interaction.options.getString("role"),
			team: interaction.options.getString("team"),
			games_played: 0,
			games_won: 0,
			games_lost: 0,
		};

		await db.collection("Players").create(data);

		interaction.reply(
			`Successfully created profile for ${interaction.options.getString(
				"firstname"
			)}`
		);
	},
};
