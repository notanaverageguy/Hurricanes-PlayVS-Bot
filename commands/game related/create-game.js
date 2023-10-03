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
	user_permissions: [PermissionsBitField.Flags.ViewAuditLog],
	bot_permissions: [],

	async execute(interaction) {
		const opponent = interaction.options
			.getString("opponent")
			.toLowerCase();
		const team = interaction.options.getString("team");
		const playerSearches = interaction.options
			.getString("players")
			.split(",")
			.map((player) => {
				return player.trim().toLowerCase();
			});
		const time = interaction.options.getString("time");

		const timeRegex =
			/^202[3-9](?:-|\/)(?:0?[1-9]|1[0-2])(?:-|\/)(?:0?[1-9]|[12][0-9]|3[01])$/gm;
		if (timeRegex.exec(time) == null)
			return interaction.reply({
				content: "Invalid time",
				ephemeral: true,
			});

		const players = [];
		for (var name of playerSearches) {
			const player = await findPlayer(name);
			if (!player)
				return interaction.reply({
					content: `Invalid player ${name}`,
					ephemeral: true,
				});
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
					name: "Score",
					value: data.score,
					inline: true,
				},
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
				{ name: "\u200B", value: "\u200B", inline: false },
				{
					name: "Players",
					value: players
						.map((player) => {
							return upperCaseEveryWord(player.first_name);
						})
						.join(", "),
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
					await db.collection("Games").create(data);
					await i.update({
						content: `Successfully created game`,
						embeds: [],
						components: [],
						ephemeral: true,
					});
					break;
				case "Decline":
					await i.update({
						content: `Stopped creation of game`,
						embeds: [],
						components: [],
						ephemeral: true,
					});
					break;
			}
		});
	},
};
