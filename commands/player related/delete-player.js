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
		.setName("delete-player")
		.setDescription("Delete a player's profile")
		.addStringOption((option) =>
			option
				.setName("id")
				.setDescription("ID of player")
				.setRequired(true)
		),
	args: [],
	user_permissions: [PermissionsBitField.Flags.KickMembers],
	bot_permissions: [],

	async execute(interaction) {
		const playerID = interaction.options.getString("id");
		const player = await db
			.collection("Players")
			.getOne(playerID)
			.catch((error) => {
				return interaction.reply({
					content: `\`${playerID}\` did not exist in the database`,
					ephemeral: true,
				});
			});

		const confirmationEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Confirm deletion of player")
			.setAuthor({
				name: config.embeds.author.name,
				iconURL: config.embeds.author.iconURL,
				url: config.embeds.author.url,
			})
			.addFields(
				{
					name: "First Name",
					value: upperCaseEveryWord(player.first_name),
					inline: true,
				},
				{
					name: "Last Name",
					value: upperCaseEveryWord(player.last_name),
					inline: true,
				},
				{ name: "\u200B", value: "\u200B", inline: false },
				{
					name: "Team",
					value:
						player.team == "lbvz4f8cs2cwgsg"
							? "Smash"
							: player.team == "v799hjxptlm89pi"
							? "League"
							: "Rocket League",
					inline: true,
				},
				{
					name: "Role",
					value: player.role,
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
					await db.collection("Players").delete(playerID);
					await i.update({
						content: `Successfully deleted player`,
						embeds: [],
						components: [],
						ephemeral: true,
					});
					break;
				case "Decline":
					await i.update({
						content: `Stopped deletion of player`,
						embeds: [],
						components: [],
						ephemeral: true,
					});
					break;
			}
		});
	},
};
