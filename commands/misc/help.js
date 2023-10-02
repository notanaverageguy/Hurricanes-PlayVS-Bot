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
				{ name: "Page 1", value: "Player Related" },
				{ name: "Page 2", value: "Game Related" },
				{ name: "Page 3", value: "Round Related" }
			);

		const player = new EmbedBuilder()
			.setColor("Blue")
			.setTitle("Player Commands")
			.addFields(
				{
					name: "/create-player",
					value: "Creates a player in the database",
				},
				{
					name: "/delete-user",
					value: "Deletes a player in the database",
				},
				{ name: "/update-player", value: "Update a player's profile" },
				{ name: "/player", value: "Gets stats of a single player" },
				{ name: "/player-list", value: "Gets all players" },
				{
					name: "/search-player",
					value: "Gets stats of a mutiple players, seperate by comma",
				}
			)
			.setTimestamp();

		const game = new EmbedBuilder()
			.setColor("Blue")
			.setTitle("Game Commands")
			.addFields(
				{ name: "/create-game", value: "Creates a game" },
				{ name: "/delete-game", value: "Deletes a game" },
				{ name: "/update-game", value: "Update a game's profile" },
				{ name: "/game", value: "Gets stats of a single game" },
				{ name: "/game-list", value: "Gets all games" }
			)
			.setTimestamp();
		const round = new EmbedBuilder()
			.setColor("Blue")
			.setTitle("Round Commands")
			.addFields(
				{ name: "/create-round", value: "Creates a round" },
				{ name: "/delete-round", value: "Deletes a round" },
				{ name: "/update-round", value: "Update a round's profile" },
				{ name: "/round", value: "Gets stats of a single round" },
				{ name: "/round-list", value: "Gets all round" }
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
		});
		const collector = await message.createMessageComponentCollector();

		collector.on("collect", async (i) => {
			if (i.user.id !== interaction.user.id) {
				return await i.reply({
					content: `Only ${interaction.user.tag} can use these buttons!`,
					ephmeral: true,
				});
			}

			switch (i.customId) {
				case "player":
					await i.update({ embeds: [player], components: [button] });
					break;
				case "game":
					await i.update({ embeds: [game], components: [button] });
					break;
				case "round":
					await i.update({ embeds: [round], components: [button] });
					break;
			}
		});
	},
};
