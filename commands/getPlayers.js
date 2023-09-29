const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { db } = require("../libs/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("get-players")
    .setDescription("Gets all players"),

  args: [],
  permissions: [],

  async execute(interaction) {
	var playerList = await db.collection("Players").getFullList();
	const exampleEmbed = new EmbedBuilder()
	.setColor(0x0099FF)
	.setTitle('Players on the Hurricanes Team')
	.setAuthor({ name: 'Bot made by Naag', iconURL: 'https://cdn.discordapp.com/avatars/952239410055888916/48e9b5fcc52babe9ad6e68d49dad124c.webp', url: 'https://discord.js.org' })

	for(const player of playerList) {
		exampleEmbed.addFields({ name: `${player.name}`, value: `${player.role}`, inline: true });
	}

    interaction.reply({ embeds: [exampleEmbed] });
  },
};
