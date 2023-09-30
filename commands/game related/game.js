const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { db, calcGameScore } = require("../../libs/database.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("game")
		.setDescription("Gets stats of a game")
		.addStringOption((option) =>
			option
				.setName("id")
				.setDescription("The ID of the game to get stats of")
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName("opponent")
				.setDescription("Opponents of the match")
				.setRequired(false)
		),

	args: [],
	permissions: [],

	async execute(interaction) {
		const idSearch = interaction.options.getString("id");
		const opponentSearch = interaction.options.getString("opponent");
		var game;

		if (idSearch != null) {
			game = await db
				.collection("Games")
				.getOne(idSearch)
				.catch(() => {
					interaction.reply(
						`No game found with ID '**${idSearch}**'`
					);
				});
		} else if (opponentSearch != null) {
			var target = interaction.options.getString("opponent");
			target = target.toLowerCase();

			game = await db
				.collection("Games")
				.getFirstListItem(`first_name = '${target}'`)
				.catch(() => {
					interaction.reply(
						`No game found with first name '**${opponentSearch}**'`
					);
				});
		} else {
			interaction.reply(
				`You must input either an ***ID*** or a ***first name***`
			);
			return;
		}
		try {
			game = await calcGameScore(game.id);
			const team = await db.collection("Teams").getOne(game.team);
			const embed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(`vs. ${game.opponent}`)
				.setAuthor({
					name: "Bot made by Naag",
					iconURL:
						"https://cdn.discordapp.com/avatars/952239410055888916/48e9b5fcc52babe9ad6e68d49dad124c.webp",
					url: "https://discord.js.org",
				})
				.addFields(
					{ name: "Team", value: team.name, inline: true },
					{ name: "Score", value: game.score, inline: true },
					{
						name: "Date",
						value: game.played.split(" ")[0],
						inline: true,
					}
				)
				.setFooter({
					text: `Game id: ${game.id}`,
				});

			// Getting rounds
			const rounds = await db.collection("Rounds").getFullList({
				filter: `game.id = "${game.id}"`,
			});

			for (const index in rounds) {
				const round = rounds[index];

				embed.addFields({
					name: `Round ${index + 1}`,
					value: `**Score:** *${round.score}*`,
					inline: true,
				});
			}

			embed.addFields({
				name: "\u200B",
				value: "\u200B",
				inline: false,
			});

			// Getting players
			for (var player of game.players) {
				player = await db.collection("Players").getOne(player);
				embed.addFields({
					name: `**${player.first_name}**`,
					value: `${player.role}`,
					inline: true,
				});
			}

			interaction.reply({ embeds: [embed] });
		} catch (e) {
			console.log(e);
		}
	},
};
