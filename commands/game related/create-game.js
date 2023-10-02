const { SlashCommandBuilder } = require("discord.js");
const { PermissionsBitField } = require('discord.js');
const { db, findPlayer } = require("../../libs/database.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("create-game")
		.setDescription("Creates a game")
		.addStringOption((option) =>
			option
				.setName("opponent")
				.setDescription("name of opponents")
				.setRequired(true)
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
		)
		.addStringOption((option) =>
			option
				.setName("players")
				.setDescription(
					"Seperate by comma. Can search by id, first name, last name, first and last name"
				)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("time")
				.setDescription("YYYY-MM-DD")
				.setRequired(true)
		),

	args: [],
	user_permissions: [
		PermissionsBitField.Flags.ViewAuditLog
	],
	bot_permissions: [],

	async execute(interaction) {
		const opponent = interaction.options.getString("opponent").toLowerCase();
		const team = interaction.options.getString("team");
		const playerSearches = interaction.options
			.getString("players")
			.split(",")
			.map((player) => {
				return player.trim();
			});
		const time = interaction.options.getString("time");

		const timeRegex =
			/^202[3-9](?:-|\/)(?:0?[1-9]|1[0-2])(?:-|\/)(?:0?[1-9]|[12][0-9]|3[01])$/gm;
		if (timeRegex.exec(time) == null)
			return interaction.reply("Invalid Time");

		const players = [];
		for (var name of playerSearches) {
			const player = await findPlayer(name);
			if (!player)
				return interaction.reply(`Invalid player search \`${name}\``);
			players.push(player);
		}

		const data = {
			opponent: opponent.toLowerCase(),
			score: "0 - 0",
			win: false,
			team: team,
			players: players.map((player) => {
				return player.id;
			}),
			played: `${time} 15:30:00Z`,
		};

		await db.collection("Games").create(data);

		interaction.reply(`Successfully created game`);
	},
};
