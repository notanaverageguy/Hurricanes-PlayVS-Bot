const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Displays all commands"),

	args: [],
	permissions: [],

	async execute(interaction) {
		interaction.reply("asdoikasdkpodsapjokdsakposdakop");
	},
};
