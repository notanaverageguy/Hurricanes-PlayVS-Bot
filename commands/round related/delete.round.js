const { SlashCommandBuilder } = require("discord.js");
const { PermissionsBitField } = require("discord.js");
const { db } = require("../../libs/database.js");
const config = require("../../config.json");
module.exports = {
	data: new SlashCommandBuilder()
		.setName("delete-round")
		.setDescription("Delete a round")
		.addStringOption((option) =>
			option
				.setName("id")
				.setDescription("ID of the round")
				.setRequired(true)
		),
	args: [],
	user_permissions: [PermissionsBitField.Flags.KickMembers],
	bot_permissions: [],

	async execute(interaction) {
		const roundID = interaction.options.getString("id");

		try {
			await db.collection("Rounds").delete(roundID);
		} catch (error) {
			console.log(error);
			if (error.response.code == 404)
				interaction.reply({
					content: `\`${roundID}\` did not exist in the database`,
					ephemeral: true,
				});

			if (error.response.code == 400)
				interaction.reply({
					content: `Failed to delete record. \nRound has relationship to something somehow\nNo idea how this error occured\<@${config.owner}>`,
					ephemeral: true,
				});
			return;
		}

		interaction.reply(`Successfully deleted game ${roundID}`);
	},
};
