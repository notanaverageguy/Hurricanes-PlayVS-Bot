const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { PermissionsBitField } = require('discord.js');
const { db, findPlayer } = require("../../libs/database.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("update-game")
		.setDescription("Updates a game's profile")
		.addStringOption((option) =>
			option
				.setName("id")
				.setDescription("ID of the game")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("opponent")
				.setDescription("name of opponents")
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName("team")
				.setDescription("The team the player is on")
				.setRequired(false)
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
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName("time")
				.setDescription("YYYY-MM-DD")
				.setRequired(false)
		),

	args: [],
	user_permissions: [
		PermissionsBitField.Flags.ViewAuditLog
	],
	bot_permissions: [],

	async execute(interaction) {
		const id = interaction.options.getString("id");
		const team = interaction.options.getString("team");
		const opponent = interaction.options.getString("opponent");
		const time = interaction.options.getString("time");
		var playerSearches = interaction.options.getString("players");

		const game = await db
			.collection("Games")
			.getOne(id)
			.catch(() => {
				return null;
			});

		const data = {};
		if (team != null) data.team = team;
		if (opponent != null) data.opponent = opponent.toLowerCase();
		if (game == null)
			return interaction.reply(`Game with id \`${id}\` not found`);
		if (time != null) {
			const timeRegex =
				/^202[3-9](?:-|\/)(?:0?[1-9]|1[0-2])(?:-|\/)(?:0?[1-9]|[12][0-9]|3[01])$/gm;
			if (timeRegex.exec(time) == null)
				return interaction.reply("Invalid Time");
			data.played = `${time} 15:30:00Z`;
		}
		if (playerSearches != null) {
			playerSearches = playerSearches.split(",").map((player) => {
				return player.trim();
			});

			const players = [];
			for (var name of playerSearches) {
				const player = await findPlayer(name);
				if (!player)
					return interaction.reply(
						`Invalid player search \`${name}\``
					);
				players.push(player);
			}
			data.players = players.map((player) => {
				return player.id;
			});
		}

		await db.collection("Games").update(id, data);
		interaction.reply(`Successfully updated game`);
	},
};
