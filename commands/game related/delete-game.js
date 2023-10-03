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
		.setName("delete-game")
		.setDescription("Delete a game")
		.addStringOption((option) =>
			option
				.setName("id")
				.setDescription("ID of the game")
				.setRequired(true)
		),
	args: [],
	user_permissions: [PermissionsBitField.Flags.KickMembers],
	bot_permissions: [],

	async execute(interaction) {
		const gameID = interaction.options.getString("id");
		const game = await db
			.collection("Games")
			.getOne(gameID)
			.catch((error) => {
				return interaction.reply({
					content: `\`${gameID}\` did not exist in the database`,
					ephemeral: true,
				});
			});

		const rounds = await db.collection("Rounds").getFullList({
			filter: `game.id = "${gameID}"`,
		});
		const confirmationEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Confirm deletion of game")
			.setAuthor({
				name: config.embeds.author.name,
				iconURL: config.embeds.author.iconURL,
				url: config.embeds.author.url,
			})
			.addFields(
				{
					name: "Opponent",
					value: upperCaseEveryWord(game.opponent),
					inline: true,
				},
				{
					name: "Score",
					value: upperCaseEveryWord(game.score),
					inline: true,
				},
				{
					name: "Rounds",
					value: `${rounds.length}`,
					inline: true,
				},
				{ name: "\u200B", value: "\u200B", inline: false },
				{
					name: "Team",
					value:
						game.team == "lbvz4f8cs2cwgsg"
							? "Smash"
							: game.team == "v799hjxptlm89pi"
							? "League"
							: "Rocket League",
					inline: true,
				}
			)
			.setFooter({ text: `Played on ${game.played}` });

		const players = [];
		for (var player of game.players) {
			player = await db.collection("Players").getOne(player);
			players.push(player.first_name);
		}
		confirmationEmbed.addFields({
			name: "Players",
			value: players
				.map((player) => {
					return upperCaseEveryWord(player);
				})
				.join(", "),
			inline: true,
		});

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
					await db.collection("Games").delete(gameID);
					await i.update({
						content: `Successfully deleted game`,
						embeds: [],
						components: [],
						ephemeral: true,
					});
					break;
				case "Decline":
					await i.update({
						content: `Stopped deletion of game`,
						embeds: [],
						components: [],
						ephemeral: true,
					});
					break;
			}
		});
	},
};
