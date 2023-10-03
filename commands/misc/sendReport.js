const { SlashCommandBuilder } = require("discord.js");
const config = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("report")
		.setDescription("Sends a report to naag")
		.addStringOption((option) =>
			option
				.setName("reason")
				.setDescription("Reason for sending a report")
				.setRequired(true)
		),

	args: ["client"],
	permissions: [],

	async execute(interaction, client) {
		const reasoning = interaction.options.getString("reason");

		const reportChannel = client.channels.cache.get(
			config.reportingChannelID
		);
		reportChannel.send(
			`\`${interaction.user.displayName}\` sent report \`${reasoning}\``
		);
		interaction.reply({
			content: "Successfully sent report",
			ephemeral: true,
		});
	},
};
