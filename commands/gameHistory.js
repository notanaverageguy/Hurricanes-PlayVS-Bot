const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { db } = require("../libs/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gamehistory")
    .setDescription("Gets the game history of a player")
    .addStringOption(option =>
		option.setName('firstname')
			.setDescription('That player to get history of')
			.setRequired(true)),

  args: [],
  permissions: [],

  async execute(interaction) {
    var target = interaction.options.getString('firstname');
    target = target.toLowerCase();
    target = target.charAt(0).toUpperCase() + target.slice(1);


    var player;
    try {
        player = await db.collection("Players").getFirstListItem(`first_name = '${target}'`, options = {});
    } catch (ClientResponseError){
        return interaction.reply("Player doesn't exist");
    }

    const team = await db.collection("Teams").getOne(player.team);
    var matches = await db.collection("Matches").getFullList();

    var tempa = [];
    for(const match of matches) {
        if(match.players.includes(player.id)) tempa.push(match);
    }
    matches = tempa; delete tempa;

	const exampleEmbed = new EmbedBuilder()
	.setColor(0x0099FF)
	.setTitle(`Stats for ${player.name}`)
	.setAuthor({ name: 'Bot made by Naag', iconURL: 'https://cdn.discordapp.com/avatars/952239410055888916/48e9b5fcc52babe9ad6e68d49dad124c.webp', url: 'https://discord.js.org' })
	.addFields(
		{ name: 'role', value: player.role },
		{ name: 'Team', value: team.name, inline: true },
		{ name: 'Games Played', value: `${player.games_played}`, inline: true },
	)

    interaction.reply({ embeds: [exampleEmbed] });
  },
};
