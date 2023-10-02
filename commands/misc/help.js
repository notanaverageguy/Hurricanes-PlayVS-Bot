const {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Displays all commands"),

	args: [],
	permissions: [],

	async execute(interaction) {
		const helpCenter = new EmbedBuilder()
			.setColor("Blue")
			.setTitle("Help Center")
			.setDescription("Help Command Guide:")
			.addFields(
				{ name: "Page 1", value: "Player Related", inline: true },
				{ name: "Page 2", value: "Game Related", inline: true },
				{
					name: "Page 3",
					value: "Round Related",
					inline: true,
					inline: true,
				}
			);

		const player = new EmbedBuilder()
			.setColor("Blue")
			.setTitle("Player Commands")
			.addFields(
				{
					name: "/create-player",
					value: "Creates a player in the database",
					inline: true,
				},
				{
					name: "/delete-user",
					value: "Deletes a player in the database",
					inline: true,
				},
				{
					name: "/update-player",
					value: "Update a player's profile",
					inline: true,
				},
				{
					name: "/player",
					value: "Gets stats of a single player",
					inline: true,
				},
				{
					name: "/player-list",
					value: "Gets all players",
					inline: true,
				},
				{
					name: "/search-player",
					value: "Gets stats of a mutiple players, seperate by comma",
					inline: true,
				}
			)
			.setTimestamp();

		const game = new EmbedBuilder()
			.setColor("Blue")
			.setTitle("Game Commands")
			.addFields(
				{
					name: "/create-game",
					value: "Creates a game",
					inline: true,
					inline: true,
				},
				{
					name: "/delete-game",
					value: "Deletes a game",
					inline: true,
					inline: true,
				},
				{
					name: "/update-game",
					value: "Update a game's profile",
					inline: true,
					inline: true,
				},
				{
					name: "/game",
					value: "Gets stats of a single game",
					inline: true,
					inline: true,
				},
				{
					name: "/game-list",
					value: "Gets all games",
					inline: true,
					inline: true,
				}
			)
			.setTimestamp();
		const round = new EmbedBuilder()
			.setColor("Blue")
			.setTitle("Round Commands")
			.addFields(
				{
					name: "/create-round",
					value: "Creates a round",
					inline: true,
				},
				{
					name: "/delete-round",
					value: "Deletes a round",
					inline: true,
				},
				{
					name: "/update-round",
					value: "Update a round's profile",
					inline: true,
				},
				{
					name: "/round",
					value: "Gets stats of a single round",
					inline: true,
				},
				{ name: "/round-list", value: "Gets all round", inline: true }
			)
			.setTimestamp();

		const button = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId(`player`)
				.setLabel("Player Commands")
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId(`game`)
				.setLabel("Game Commands")
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId(`round`)
				.setLabel("Round Commands")
				.setStyle(ButtonStyle.Primary)
		);

		const message = await interaction.reply({
			embeds: [helpCenter],
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
				case "player":
					await i.update({
						embeds: [player],
						components: [button],
						ephemeral: true,
					});
					break;
				case "game":
					await i.update({
						embeds: [game],
						components: [button],
						ephemeral: true,
					});
					break;
				case "round":
					await i.update({
						embeds: [round],
						components: [button],
						ephemeral: true,
					});
					break;
			}
		});
	},
};
