const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { db } = require("../../libs/database.js");
const { upperCaseEveryWord } = require("../../libs/utils.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("roundlist")
		.setDescription("Gets all rounds")
		.addIntegerOption((option) =>
			option
				.setName("page")
				.setDescription("Page of matches to display ")
				.setRequired(false)
		),

	args: [],
	permissions: [],

	async execute(interaction) {
        const page = interaction.options.getInteger("page") ?? 1;
		var roundList = await db.collection("Rounds").getList(page, 9, {
			sort: "played",
		});
		const exampleEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Round history of the Hurricanes League")
			.setAuthor({
				name: "Bot made by Naag",
				iconURL:
					"https://cdn.discordapp.com/avatars/952239410055888916/48e9b5fcc52babe9ad6e68d49dad124c.webp",
				url: "https://discord.js.org",
			})
            .setFooter({text: `Page ${page} out of ${roundList.totalPages}`});

		for (const round of roundList.items) {
			const team = await db.collection("Teams").getOne(round.team);
			exampleEmbed.addFields({
				name: `vs. ${upperCaseEveryWord(round.opponent)}`,
				value: `\`ID: ${round.id}\`\n**Round:** ${
					round.round
				}\n**Team:** ${team.name}\n**Score:** ${
					round.score
				}\n**Date:** ${round.played.split(" ")[0]}`,
				inline: true,
			});
		}

		interaction.reply({ embeds: [exampleEmbed] });
	},
};
