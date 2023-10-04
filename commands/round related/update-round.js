const {
	SlashCommandBuilder,
	PermissionsBitField,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");

const { db, findPlayer } = require("../../libs/database.js");
const { upperCaseEveryWord, getTeamName } = require("../../libs/utils.js");
const config = require("../../config.json");

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
	user_permissions: [PermissionsBitField.Flags.ManageNicknames],
	bot_permissions: [],

	async execute(interaction) {
		const id = interaction.options.getString("id");
		const game_id = interaction.options.getString("game-id");
		const roundNum = interaction.options.getInteger("round");
		var score = interaction.options.getString("score");
		var playerSearches = interaction.options.getString("players");
		const time = interaction.options.getString("time");

		var round = await db
			.collection("Rounds")
			.getOne(id)
			.catch(() => {
				return null;
			});

		const currentPlayers = [];
		for (const id of round.players) {
			const player = await db.collection("Players").getOne(id);
			currentPlayers.push(player);
		}

		var data = {};
		if (roundNum != null) data.round = roundNum;
		if (game_id != null) {
			data.game = game_id;

			const game = await db
				.collection("Games")
				.getOne(game_id)
				.catch(() => {
					return interaction.reply({
						content: `Invalid player search \`${name}\``,
						ephemeral: true,
					});
				});

			data.opponent = game.opponent;
		}

		if (score != null) {
			score = score.trim().replace(" ", "");
			const scoreRegex = /^[0-9]+-[0-9]+$/gm;
			if (scoreRegex.exec(score) == null)
				return interaction.reply({
					content: `Invalid player score`,
					ephemeral: true,
				});
			data.score = score;
		}

		const players = [];
		if (playerSearches != null) {
			playerSearches = playerSearches.split(",").map((player) => {
				return player.trim();
			});
			const players = [];
			for (var name of playerSearches) {
				const player = await findPlayer(name);
				if (!player)
					return interaction.reply({
						content: `Invalid player search \`${name}\``,
						ephemeral: true,
					});
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
				return interaction.reply({
					content: `Invalid time`,
					ephemeral: true,
				});
			data.played = `${time}Z`;
		}

		if (Object.keys(data).length == 0)
			return interaction.reply({
				content: `You updated no data`,
				ephemeral: true,
			});

		const confirmationEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Confirm round update")
			.setAuthor({
				name: config.embeds.author.name,
				iconURL: config.embeds.author.iconURL,
				url: config.embeds.author.url,
			})
			.addFields(
				{
					name: "Opponent",
					value: `${
						data.opponent != undefined
							? `~~${upperCaseEveryWord(
									round.opponent
							  )}~~ -> ${upperCaseEveryWord(data.opponent)}`
							: `${upperCaseEveryWord(round.opponent)}`
					}`,
				},
				{
					name: "Round",
					value: `${
						data.round != undefined
							? `~~${round.round}~~ -> ${data.round}`
							: `${round.round}`
					}`,
				},
				{
					name: "Score",
					value: `${
						data.score != undefined
							? `~~${upperCaseEveryWord(
									round.score
							  )}~~ -> ${upperCaseEveryWord(data.score)}`
							: `${upperCaseEveryWord(round.score)}`
					}`,
				},
				{
					name: "Team",
					value:
						data.team != undefined
							? `~~${getTeamName(round.team)}~~ -> ${getTeamName(
									data.team
							  )}`
							: `${getTeamName(round.team)}`,
				},
				{
					name: "Players",
					value:
						data.players != undefined
							? `~~${currentPlayers
									.map((player) => {
										return upperCaseEveryWord(
											player.first_name
										);
									})
									.join(", ")}~~ -> ${players
									.map((player) => {
										return upperCaseEveryWord(
											player.first_name
										);
									})
									.join(", ")}`
							: `${currentPlayers
									.map((player) => {
										return upperCaseEveryWord(
											player.first_name
										);
									})
									.join(", ")}`,
				}
			);

		const button = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId(`Confirm`)
				.setStyle(ButtonStyle.Success)
				.setEmoji("✔"),
			new ButtonBuilder()
				.setCustomId(`Decline`)
				.setStyle(ButtonStyle.Danger)
				.setEmoji("✖")
		);

		const message = await interaction.reply({
			embeds: [confirmationEmbed],
			components: [button],
			ephemeral: true,
		});
		const collector = await message.createMessageComponentCollector();

		collector.on("collect", async (i) => {
			if (i.user.id !== interaction.user.id) {
				return await i.reply({
					content: `Only ${interaction.user.tag} can use these buttons!`,
					ephemeral: true,
				});
			}

			switch (i.customId) {
				case "Confirm":
					await db.collection("Rounds").update(id, data);
					await i.update({
						content: `Successfully updated round`,
						embeds: [],
						components: [],
						ephemeral: true,
					});
					break;
				case "Decline":
					await i.update({
						content: `Stopped update for round`,
						embeds: [],
						components: [],
						ephemeral: true,
					});
					break;
			}
		});
	},
};
