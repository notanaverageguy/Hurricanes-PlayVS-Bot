const { SlashCommandBuilder } = require("discord.js");
const { PermissionsBitField } = require("discord.js");
const { db } = require("../../libs/database.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("delete-game")
		.setDescription("Delete a game")
		.addStringOption((option) =>
			option
				.setName("id")
				.setDescription("ID of the game")
				.setRequired(true)
		),
	args: [],
	user_permissions: [
        PermissionsBitField.Flags.KickMembers
    ],
	bot_permissions: [],

	async execute(interaction) {
		const gameID = interaction.options.getString("id");

		try {
			await db.collection("Games").delete(gameID);
		} catch (error) {
            console.log(error)
			if (error.response.code == 404)
				interaction.reply(`\`${gameID}\` did not exist in the database`);

            if(error.response.code == 400)
                interaction.reply(`Failed to delete record. \nGame has relations to rounds, make sure to remove game from all rounds.\nFor assistance contact naag`);
			return;
		}

		interaction.reply(`Successfully deleted game ${gameID}`);
	},
};
