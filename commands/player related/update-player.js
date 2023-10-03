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
		.setName("update-player")
		.setDescription("Update a player's profile")
		.addStringOption((option) =>
			option
				.setName("search")
				.setDescription(
					"Can search by id, first name, last name, first and last name"
				)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("firstname")
				.setDescription("First name of player")
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName("lastname")
				.setDescription("Last name of player")
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName("role")
				.setDescription("The player's role on the team")
				.setRequired(false)
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
				.setRequired(false)
				.addChoices({ name: "Rocket League", value: "e8mjbfqf0ho1wz2" })
		),
	args: [],
	user_permissions: [PermissionsBitField.Flags.ManageNicknames],
	bot_permissions: [],

	async execute(interaction) {
		const search = interaction.options.getString("search");
		const first_name = interaction.options
			.getString("firstname")
			?.toLowerCase();
		const last_name = interaction.options
			.getString("lastname")
			?.toLowerCase();
		const team = interaction.options.getString("team");
		const role = interaction.options.getString("role");

		var data = {};
		if (first_name != null) data.first_name = first_name;
		if (last_name != null) data.last_name = last_name;
		if (team != null) data.team = team;
		if (role != null) data.role = role;

		if (Object.keys(data).length == 0)
			return interaction.reply({
				content: `You updated no data`,
				ephemeral: true,
			});

		const player = await findPlayer(search);
		if (player == null)
			return interaction.reply({
				content: `No player found with search ${search}`,
				ephemeral: true,
			});

		const confirmationEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Confirm player update")
			.setAuthor({
				name: config.embeds.author.name,
				iconURL: config.embeds.author.iconURL,
				url: config.embeds.author.url,
			})
			.addFields(
				{
					name: "First name",
					value: `${
						data.first_name != undefined
							? `~~${upperCaseEveryWord(
									player.first_name
							  )}~~ -> ${upperCaseEveryWord(data.first_name)}`
							: `${upperCaseEveryWord(player.first_name)}`
					}`,
				},
				{
					name: "Last name",
					value: `${
						data.last_name != undefined
							? `~~${upperCaseEveryWord(
									player.last_name
							  )}~~ -> ${upperCaseEveryWord(data.last_name)}`
							: `${upperCaseEveryWord(player.last_name)}`
					}`,
				},
				{
					name: "Team",
					value:
						data.team != undefined
							? `~~${getTeamName(player.team)}~~ -> ${getTeamName(
									data.team
							  )}`
							: `${getTeamName(player.team)}`,
				},
				{
					name: "Role",
					value: `${
						data.role != undefined
							? `~~${player.role}~~ -> ${data.role}`
							: `${player.role}`
					}`,
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
					await db.collection("Players").update(player.id, data);
					await i.update({
						content: `Successfully updated player`,
						embeds: [],
						components: [],
						ephemeral: true,
					});
					break;
				case "Decline":
					await i.update({
						content: `Stopped updating player`,
						embeds: [],
						components: [],
						ephemeral: true,
					});
					break;
			}
		});
	},
};
