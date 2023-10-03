const {
	SlashCommandBuilder,
	PermissionsBitField,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");

const { db, findPlayer } = require("../../libs/database.js");
const { upperCaseEveryWord, getTeamName } = require("../../libs/utils.js");
const config = require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Makes sure the bot is working"),

	args: [],
	permissions: [],

	async execute(interaction) {
		interaction.reply({ content: "pong", ephemeral: true });
	},
};
