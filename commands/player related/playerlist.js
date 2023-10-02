const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { db } = require("../../libs/database.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("playerlist")
		.setDescription("Gets all players")
		.addIntegerOption((option) =>
			option
				.setName("page")
				.setDescription("Page of matches to display ")
				.setRequired(false)
		),

	args: [],
	user_permissions: [],
	bot_permissions: [],

	async execute(interaction) {
		const page = interaction.options.getInteger("page") ?? 1;
		var playerList = await db.collection("Players").getList(page, 9, {
			sort: "team,role",
		});
		const exampleEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Players on the Hurricanes Team")
			.setAuthor({
				name: "Bot made by Naag",
				iconURL:
					"https://cdn.discordapp.com/avatars/952239410055888916/48e9b5fcc52babe9ad6e68d49dad124c.webp",
				url: "https://discord.js.org",
			})
			.setFooter({text: `Page ${page} out of ${playerList.totalPages}`});

		for (const player of playerList.items) {
			const team = await db.collection("Teams").getOne(player.team);
			exampleEmbed.addFields({
				name: `${player.first_name} ${player.last_name}`,
				value: `\`ID: ${player.id}\`\n**Team:** ${team.name}\n**Role:** ${player.role}`,
				inline: true,
			});
		}

		interaction.reply({ embeds: [exampleEmbed] });
	},
};
