const { SlashCommandBuilder } = require("discord.js");
const { PermissionsBitField } = require("discord.js");
const { db } = require("../../libs/database.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("delete-player")
		.setDescription("Delete a player's profile")
		.addStringOption((option) =>
			option
				.setName("id")
				.setDescription("ID of player")
				.setRequired(true)
		),
	args: [],
	user_permissions: [
        PermissionsBitField.Flags.KickMembers
    ],
	bot_permissions: [],

	async execute(interaction) {
		const playerID = interaction.options.getString("id");

		try {
			await db.collection("Players").delete(playerID);
		} catch (error) {
            console.log(error)
			if (error.response.code == 404)
				interaction.reply(`\`${playerID}\` did not exist in the database`);

            if(error.response.code == 400)
                interaction.reply(`Failed to delete record.\nPlayer has relations to rounds, make sure to remove player from all rounds and games.\nFor assistance contact naag`);
			return;
		}

		interaction.reply(`Successfully deleted profile for ${playerID}`);
	},
};
