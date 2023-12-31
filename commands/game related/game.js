const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { db, calcGameScore } = require("../../libs/database.js");
const { upperCaseEveryWord } = require("../../libs/utils.js");

const config = require("../../config.json");
module.exports = {
	data: new SlashCommandBuilder()
		.setName("game")
		.setDescription("Gets stats of a game")
		.addStringOption((option) =>
			option
				.setName("search")
				.setDescription("ID OR opponent of the game")
				.setRequired(true)
		),

	args: [],
	user_permissions: [],
	bot_permissions: [],

	async execute(interaction) {
		const search = interaction.options.getString("search");
		const games = await db.collection("Games").getFullList({
			filter: `id='${search}'||opponent='${search.toLowerCase()}'`,
		});

		if (!games.length)
			return interaction.reply({
				content: `No game found with search '**${search}**'`,
				ephemeral: true,
			});

		const embeds = [];
		for (var game of games) {
			game = await calcGameScore(game.id);
			const team = await db.collection("Teams").getOne(game.team);
			const embed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(`vs. ${upperCaseEveryWord(game.opponent)}`)
				.setAuthor({
					name: config.embeds.author.name,
					iconURL: config.embeds.author.iconURL,
					url: config.embeds.author.url,
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
				sort: `round`
			});

			for (const index in rounds) {
				const round = rounds[index];

				embed.addFields({
					name: `Round ${round.round}`,
					value: `\`ID: ${round.id}\`\n**Score:** *${
						round.score
					}*\n**Outcome:** *${round.won ? "won" : "loss"}*`,
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
					name: `**${upperCaseEveryWord(player.first_name)}**`,
					value: `${player.role}`,
					inline: true,
				});
			}

			embeds.push(embed);
		}

		interaction.reply({
			content: `${
				embeds.length == 1
					? ""
					: `Found ${embeds.length} games using search ${search}`
			}`,
			embeds: embeds,
			ephemeral: true,
		});
	},
};
