const { SlashCommandBuilder } = require("discord.js");
const { db, findPlayer } = require("../../libs/database.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("create-round")
		.setDescription("Creates a round")
		.addStringOption((option) =>
			option
				.setName("game-id")
				.setDescription("ID for the matrch")
				.setRequired(true)
		)
		.addIntegerOption((option) =>
			option
				.setName("round")
				.setDescription("Round number for the match")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("score")
				.setDescription("Score achieved, Valid score is x-y")
				.setRequired(true)
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
				.setDescription("YYYY-MM-DD HH:MM:SS")
				.setRequired(true)
		),

	args: [],
	permissions: [],

	async execute(interaction) {
		const playerSearches = interaction.options
			.getString("players")
			.split(",")
			.map((player) => {
				return player.trim();
			});

		const score = interaction.options
			.getString("score")
			.trim()
			.replace(" ", "");
		const scoreRegex = /^[0-9]+-[0-9]+$/gm;
		if (scoreRegex.exec(score) == null)
			return interaction.reply("Invalid Score");

		const time = interaction.options.getString("time").trim();
		const timeRegex =
			/^202[3-9](?:-|\/)(?:0?[1-9]|1[0-2])(?:-|\/)(?:0?[1-9]|[12][0-9]|3[01]) (?:(?:[0-1]?[0-9])|(?:2[04])):(?:[0-5]?[0-9]):(?:[0-5]?[0-9])$/gm;
		if (timeRegex.exec(time) == null)
			return interaction.reply("Invalid Time");

		const players = [];
		for (var name of playerSearches) {
			const player = await findPlayer(name);
			if (!player)
				return interaction.reply(`Invalid player search \`${name}\``);
			players.push(player);
		}

		const id = interaction.options.getString("game-id");
		const game = await db
			.collection("Games")
			.getOne(id)
			.catch(() => {
				return null;
			});

		if (game == null) return interaction.reply(`Invalid game id \`${id}\``);

		const data = {
			round: interaction.options.getInteger("round"),
			opponent: game.opponent,
			score: score.replace("-", " - "),
			win: score.split("-")[0] > score.split("-")[1],
            game: game.id,
			team: game.team,
			players: players.map((player) => {
				return player.id;
			}),
			played: `${time}Z`,
		};
		await db.collection("Rounds").create(data);

		interaction.reply(`Successfully created round`);
	},
};
