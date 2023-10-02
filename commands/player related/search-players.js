const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { db, findPlayer, calcPlayerWins } = require("../../libs/database.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("search-players")
		.setDescription("Gets stats of a mutiple players, seperate by comma")
		.addStringOption((option) =>
			option
				.setName("search")
				.setDescription(
					"Can search by id, first name, last name, first and last name"
				)
				.setRequired(true)
		),

	args: [],
	user_permissions: [],
	bot_permissions: [],

	async execute(interaction) {
		const search = interaction.options.getString("search");
		var players = search.split(",").map((player) => {
			return player.trim();
		});
		players = players.filter(
			(item, index) => players.indexOf(item) === index
		);

		console.log(players);

		if (players.length > 10)
			return interaction.reply({
				content: "Can not search for more than 10 people at a time",
				ephemeral: true,
			});

		const embeds = [];
		const missingPeople = [];
		for (const player of players) {
			const playerStats = await findPlayer(player);

			if (playerStats == null) {
				missingPeople.push(player);
				continue;
			}

			const team = await db.collection("Teams").getOne(playerStats.team);
			const embed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(`Stats for ${playerStats.first_name}`)
				.setAuthor({
					name: "Bot made by Naag",
					iconURL:
						"https://cdn.discordapp.com/avatars/952239410055888916/48e9b5fcc52babe9ad6e68d49dad124c.webp",
					url: "https://discord.js.org",
				})
				.addFields(
					{ name: "Team", value: team.name, inline: true },
					{ name: "Role", value: playerStats.role, inline: true },
					{ name: "\u200B", value: "\u200B", inline: true },
					{
						name: "Games Played",
						value: `${playerStats.games_played}`,
						inline: true,
					},
					{
						name: "Games Won",
						value: `${playerStats.games_won}`,
						inline: true,
					},
					{
						name: "Games Lost",
						value: `${playerStats.games_lost}`,
						inline: true,
					}
				)
				.setFooter({
					text: `Player id: ${playerStats.id}`,
				});
			embeds.push(embed);
		}
		interaction.reply({
			content: `${
				missingPeople.length
					? `Could not find stats for ${missingPeople.join(", ")}`
					: ""
			}`,
			embeds: embeds,
			ephemeral: true,
		});
	},
};
