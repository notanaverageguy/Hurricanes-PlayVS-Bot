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
		.setName("create-player")
		.setDescription("Creates a player's profile")
		.addStringOption((option) =>
			option
				.setName("firstname")
				.setDescription("First name of player")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("lastname")
				.setDescription("First name of player")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("role")
				.setDescription("The player's role on the team")
				.setRequired(true)
				.addChoices(
					{ name: "Player", value: "Player" },
					{ name: "Sub", value: "Substitute" },
					{ name: "Captain", value: "Captian" }
				)
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
		),
	args: [],
	user_permissions: [PermissionsBitField.Flags.ManageNicknames],
	bot_permissions: [],

	async execute(interaction) {
		const data = {
			first_name: interaction.options
				.getString("firstname")
				.trim()
				.toLowerCase(),
			last_name: interaction.options
				.getString("lastname")
				.trim()
				.toLowerCase(),
			role: interaction.options.getString("role"),
			team: interaction.options.getString("team"),
			games_played: 0,
			games_won: 0,
			games_lost: 0,
		};

		const confirmationEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Confirm player creation")
			.setAuthor({
				name: "Bot made by Naag",
				iconURL:
					"https://cdn.discordapp.com/avatars/952239410055888916/48e9b5fcc52babe9ad6e68d49dad124c.webp",
				url: "https://discord.js.org",
			})
			.addFields(
				{
					name: "First Name",
					value: upperCaseEveryWord(data.first_name),
					inline: true,
				},
				{
					name: "Last Name",
					value: upperCaseEveryWord(data.last_name),
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
					name: "Role",
					value: data.role,
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
					await db.collection("Players").create(data);
					await i.update({
						content: `Successfully created player`,
						embeds: [],
						components: [],
						ephemeral: true,
					});
					break;
				case "Decline":
					await i.update({
						content: `Stopped creation of player`,
						embeds: [],
						components: [],
						ephemeral: true,
					});
					break;
			}
		});
	},
};
