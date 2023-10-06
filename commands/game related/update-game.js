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
				.setName("score")
				.setDescription("SMASH ONLY")
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
				.setDescription("YYYY-MM-DD")
				.setRequired(false)
		),

	args: [],
	user_permissions: [PermissionsBitField.Flags.ManageNicknames],
	bot_permissions: [],

	async execute(interaction) {
		const id = interaction.options.getString("id");
		const team = interaction.options.getString("team");
		const opponent = interaction.options.getString("opponent");
		const time = interaction.options.getString("time");
		const score = interaction.options.getString("score");
		var playerSearches = interaction.options.getString("players");

		var game = await db
			.collection("Games")
			.getOne(id)
			.catch(() => {
				return null;
			});

		if (game == null)
			return interaction.reply({
				content: `Game with id \`${id}\` not found`,
				ephemeral: true,
			});

		const currentPlayers = [];
		for (const id of game.players) {
			const player = await db.collection("Players").getOne(id);
			currentPlayers.push(player);
		}

		const data = {};
		if (team != null) data.team = team;
		if (opponent != null) data.opponent = opponent.toLowerCase();
		if (
			score &&
			(game.team == "lbvz4f8cs2cwgsg") | (team == "lbvz4f8cs2cwgsg")
		)
			data.score = score;

		if (time != null) {
			const timeRegex =
				/^202[3-9](?:-|\/)(?:0?[1-9]|1[0-2])(?:-|\/)(?:0?[1-9]|[12][0-9]|3[01])$/gm;
			if (timeRegex.exec(time) == null)
				return interaction.reply({
					content: `Invalid Time`,
					ephemeral: true,
				});
			data.played = `${time} 15:30:00Z`;
		}

		const players = [];
		if (playerSearches != null) {
			playerSearches = playerSearches.split(",").map((player) => {
				return player.trim();
			});

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

		if (Object.keys(data).length == 0)
			return interaction.reply({
				content: `You updated no data`,
				ephemeral: true,
			});
		console.log(data);

		const confirmationEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Confirm game update")
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
									game.opponent
							  )}~~ -> ${upperCaseEveryWord(data.opponent)}`
							: `${upperCaseEveryWord(game.opponent)}`
					}`,
				},
				{
					name: "Score",
					value: `${
						data.score != undefined
							? `~~${upperCaseEveryWord(
									game.score
							  )}~~ -> ${upperCaseEveryWord(data.score)}`
							: `${upperCaseEveryWord(game.score)}`
					}`,
				},
				{
					name: "Team",
					value:
						data.team != undefined
							? `~~${getTeamName(game.team)}~~ -> ${getTeamName(
									data.team
							  )}`
							: `${getTeamName(game.team)}`,
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
							: currentPlayers.length > 0
							? `${currentPlayers
									.map((player) => {
										return upperCaseEveryWord(
											player.first_name
										);
									})
									.join(", ")}`
							: "No players",
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
					await db.collection("Games").update(game.id, data);
					await i.update({
						content: `Successfully updated game`,
						embeds: [],
						components: [],
						ephemeral: true,
					});
					break;
				case "Decline":
					await i.update({
						content: `Stopped update for game`,
						embeds: [],
						components: [],
						ephemeral: true,
					});
					break;
			}
		});
	},
};
