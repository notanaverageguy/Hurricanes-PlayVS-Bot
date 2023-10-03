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
		.setName("delete-round")
		.setDescription("Delete a round")
		.addStringOption((option) =>
			option
				.setName("id")
				.setDescription("ID of the round")
				.setRequired(true)
		),
	args: [],
	user_permissions: [PermissionsBitField.Flags.KickMembers],
	bot_permissions: [],

	async execute(interaction) {
		const roundID = interaction.options.getString("id");
		const round = await db
			.collection("Rounds")
			.getOne(roundID)
			.catch((error) => {
				return interaction.reply({
					content: `\`${roundID}\` did not exist in the database`,
					ephemeral: true,
				});
			});

		const confirmationEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Confirm deletion of round")
			.setAuthor({
				name: config.embeds.author.name,
				iconURL: config.embeds.author.iconURL,
				url: config.embeds.author.url,
			})
			.addFields(
				{
					name: "Opponent",
					value: upperCaseEveryWord(round.opponent),
					inline: true,
				},
				{
					name: "Score",
					value: upperCaseEveryWord(round.score),
					inline: true,
				},
				{
					name: "Game ID",
					value: `${round.game}`,
					inline: true,
				},
				{ name: "\u200B", value: "\u200B", inline: false },
				{
					name: "Team",
					value:
                    round.team == "lbvz4f8cs2cwgsg"
							? "Smash"
							: round.team == "v799hjxptlm89pi"
							? "League"
							: "Rocket League",
					inline: true,
				}
			)
			.setFooter({ text: `Played on ${round.played}` });

		const players = [];
		for (var player of round.players) {
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
					await db.collection("Rounds").delete(roundID);
					await i.update({
						content: `Successfully deleted round`,
						embeds: [],
						components: [],
						ephemeral: true,
					});
					break;
				case "Decline":
					await i.update({
						content: `Stopped deletion of round`,
						embeds: [],
						components: [],
						ephemeral: true,
					});
					break;
			}
		});
	},
};
