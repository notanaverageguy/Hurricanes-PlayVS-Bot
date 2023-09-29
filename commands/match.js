const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { db } = require("../libs/database");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("match")
		.setDescription("Gets a match")
		.addStringOption((option) =>
			option
				.setName("id")
				.setDescription("ID of the match to get")
				.setRequired(true)
		),

	args: [],
	permissions: [],

	async execute(interaction) {
		var target = interaction.options.getString("id");

		var match;
		try {
			match = await db
				.collection("Matches")
				.getFirstListItem(`game = '${target}'`);
		} catch (ClientResponseError) {
			return interaction.reply("Match doesn't exist");
		}

		const players = [];
		for (const player of match.players) {
			const playerData = await db.collection("Players").getOne(player);
			players.push(playerData.first_name);
		}

		const exampleEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle(
				`Match against ${match.opponent} ( ${
					match.won ? "win" : "loss"
				} )`
			)
			.setAuthor({
				name: "Bot made by Naag",
				iconURL:
					"https://cdn.discordapp.com/avatars/952239410055888916/48e9b5fcc52babe9ad6e68d49dad124c.webp",
				url: "https://discord.js.org",
			})
			.addFields(
				{ name: "Score", value: match.score, inline: true },
				{
					name: "Players",
					value: `${players.join(", ")}`,
					inline: true,
				}
			)
			.setFooter({
				text: `Match id: ${target}`,
			});

		interaction.reply({ embeds: [exampleEmbed] });
	},
};
