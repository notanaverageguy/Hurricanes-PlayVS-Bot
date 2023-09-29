const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { db } = require("../libs/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("get-player")
    .setDescription("Gets a single player"),

  args: [],
  permissions: [],

  async execute(interaction) {
	const player = await db.collection("Players").getFirstListItem(`name = 'Omar Rosado'`, options = {});
    const team = await db.collection("Teams").getOne(player.team);
	const exampleEmbed = new EmbedBuilder()
	.setColor(0x0099FF)
	.setTitle(`Stats for ${player.name}`)
	.setAuthor({ name: 'Bot made by Naag', iconURL: 'https://cdn.discordapp.com/avatars/952239410055888916/48e9b5fcc52babe9ad6e68d49dad124c.webp', url: 'https://discord.js.org' })
	.addFields(
		{ name: 'role', value: player.role },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Team', value: team.name, inline: true },
		{ name: 'Games Played', value: player.games_played, inline: true },
	)

    interaction.reply({ embeds: [exampleEmbed] });
  },
};
