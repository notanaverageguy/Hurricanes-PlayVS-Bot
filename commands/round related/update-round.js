const { SlashCommandBuilder } = require("discord.js");
const { PermissionsBitField } = require('discord.js');
const { db, findPlayer } = require("../../libs/database.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("update-round")
		.setDescription("Updates a round's profile")
		.addStringOption((option) =>
			option
				.setName("id")
				.setDescription("ID for the round")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("game-id")
				.setDescription("ID for the match")
				.setRequired(false)
		)
		.addIntegerOption((option) =>
			option
				.setName("round")
				.setDescription("Round number for the match")
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName("score")
				.setDescription("Score achieved, Valid score is x-y")
				.setRequired(false)
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
				.setDescription("YYYY-MM-DD HH:MM:SS")
				.setRequired(false)
		),

	args: [],
	user_permissions: [
		PermissionsBitField.Flags.ManageNicknames
	],
	bot_permissions: [],

	async execute(interaction) {
		const id = interaction.options.getString("id");
		const game_id = interaction.options.getString("game-id");
		const round = interaction.options.getInteger("round");
		var score = interaction.options.getString("score");
		var playerSearches = interaction.options.getString("players");
		const time = interaction.options.getString("time");

		var data = {};
		if (game_id != null) data.game = game_id;
		if (round != null) data.round = round;
		if (score != null) {
			score = score.trim().replace(" ", "");
			const scoreRegex = /^[0-9]+-[0-9]+$/gm;
			if (scoreRegex.exec(score) == null)
				return interaction.reply(`Invalid player score`);
			data.score = score;
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
		if (time != null) {
			const timeRegex =
				/^202[3-9](?:-|\/)(?:0?[1-9]|1[0-2])(?:-|\/)(?:0?[1-9]|[12][0-9]|3[01]) (?:(?:[0-1]?[0-9])|(?:2[04])):(?:[0-5]?[0-9]):(?:[0-5]?[0-9])$/gm;
			if (timeRegex.exec(time) == null)
				return interaction.reply(`Invalid time`);
			data.played = `${time}Z`;
		}

		await db.collection("Rounds").update(id, data);
		interaction.reply(`Successfully updated round`);
	},
};
