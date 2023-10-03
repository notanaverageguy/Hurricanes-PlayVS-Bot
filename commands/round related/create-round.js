const {
	SlashCommandBuilder,
	PermissionsBitField,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");

const { db, findPlayer } = require("../../libs/database.js");
const { upperCaseEveryWord } = require("../../libs/utils.js");
const config = require("../../config.json");

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
	user_permissions: [PermissionsBitField.Flags.ManageNicknames],
	bot_permissions: [],

	async execute(interaction) {
		const playerSearches = interaction.options
			.getString("players")
			.split(",")
			.map((player) => {
				return player.trim().toLowerCase();
			});

		const score = interaction.options
			.getString("score")
			.trim()
			.replace(" ", "");
		const scoreRegex = /^[0-9]+-[0-9]+$/gm;
		if (scoreRegex.exec(score) == null)
			return interaction.reply({
				content: "Invalid Score",
				ephemeral: true,
			});

		const time = interaction.options.getString("time").trim();
		const timeRegex =
			/^202[3-9](?:-|\/)(?:0?[1-9]|1[0-2])(?:-|\/)(?:0?[1-9]|[12][0-9]|3[01]) (?:(?:[0-1]?[0-9])|(?:2[04])):(?:[0-5]?[0-9]):(?:[0-5]?[0-9])$/gm;
		if (timeRegex.exec(time) == null)
			return interaction.reply({
				content: "Invalid Time",
				ephemeral: true,
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

		const id = interaction.options.getString("game-id");
		const game = await db
			.collection("Games")
			.getOne(id)
			.catch(() => {
				return null;
			});

		if (game == null)
			return interaction.reply({
				content: `Invalid game id \`${id}\``,
				ephemeral: true,
			});

		const data = {
			opponent: game.opponent,
			round: interaction.options.getInteger("round"),
			score: score.replace("-", " - "),
			win: score.split("-")[0] > score.split("-")[1],
			game: game.id,
			team: game.team,
			players: players.map((player) => {
				return player.id;
			}),
			played: `${time}Z`,
		};
		//await db.collection("Rounds").create(data);

		const confirmationEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Confirm player creation")
			.setAuthor({
				name: config.embeds.author.name,
				iconURL: config.embeds.author.iconURL,
				url: config.embeds.author.url,
			})
			.addFields(
				{
					name: "Opponent",
					value: upperCaseEveryWord(data.opponent),
					inline: true,
				},
				{
					name: "Round",
					value: `${data.round}`,
					inline: true,
				},
				{
					name: "Score",
					value: data.score,
					inline: true,
				},
				{
					name: "Won?",
					value: `${data.win}`,
					inline: true,
				},
				{ name: "\u200B", value: "\u200B", inline: false },
				{
					name: "Team",
					value:
						data.team == "lbvz4f8cs2cwgsg"
							? "Smash"
							: data.team == "v799hjxptlm89pi"
							? "League"
							: "Rocket League",
					inline: true,
				},
				{
					name: "Players",
					value: players
						.map((player) => {
							return upperCaseEveryWord(player.first_name);
						})
						.join(", "),
					inline: true,
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
					await db.collection("Rounds").create(data);
					await i.update({
						content: `Successfully created round`,
						embeds: [],
						components: [],
						ephemeral: true,
					});
					break;
				case "Decline":
					await i.update({
						content: `Stopped creation of round`,
						embeds: [],
						components: [],
						ephemeral: true,
					});
					break;
			}
		});
	},
};
