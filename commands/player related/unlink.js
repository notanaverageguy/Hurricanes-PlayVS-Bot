const {
	SlashCommandBuilder,
	PermissionsBitField,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");

const { db, findPlayer, calcPlayerWins } = require("../../libs/database.js");
const { upperCaseEveryWord, getTeamName } = require("../../libs/utils.js");
const config = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("unlink")
		.setDescription("unlinks a discord account to a player"),

	args: [],
	permissions: [],

	async execute(interaction) {
		const user = interaction.user;
		var player = await db
			.collection("Players")
			.getFirstListItem(`discord_id = '${user.id}'`)
			.catch(() => {
				return null;
			});

		if (player == null) {
			return interaction.reply({
				content: "Accont not linked to a player",
				ephemeral: true,
			});
		}

		player = await calcPlayerWins(player.id);
		const team = getTeamName(player.team);
		const confirmationEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle(`Unlink from player ${upperCaseEveryWord(player.first_name)}`)
			.setAuthor({
				name: config.embeds.author.name,
				iconURL: config.embeds.author.iconURL,
				url: config.embeds.author.url,
			})
			.addFields(
				{ name: "Team", value: team, inline: true },
				{ name: "Role", value: player.role, inline: true },
				{ name: "\u200B", value: "\u200B", inline: true },
				{
					name: "Games Played",
					value: `${player.games_played}`,
					inline: true,
				},
				{
					name: "Games Won",
					value: `${player.games_won}`,
					inline: true,
				},
				{
					name: "Games Lost",
					value: `${player.games_lost}`,
					inline: true,
				}
			)
			.setFooter({
				text: `Player id: ${player.id}`,
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
					await db.collection("Players").update(player.id, {"discord_id": ""});
					await i.update({
						content: `Successfully unlinked player`,
						embeds: [],
						components: [],
						ephemeral: true,
					});
					break;
				case "Decline":
					await i.update({
						content: `Stopped unlinkage of player`,
						embeds: [],
						components: [],
						ephemeral: true,
					});
					break;
			}
		});
	},
};
