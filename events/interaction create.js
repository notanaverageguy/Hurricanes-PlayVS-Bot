const config = require(`../config.json`);

module.exports = {
	name: "interactionCreate",
	once: false,
	execute(client, interaction) {
		if (!interaction.isChatInputCommand()) return;

		//Logging to channel
		const auditChannel = client.channels.cache.get(config.auditChannelID);
		auditChannel.send(
			`\`${interaction.user.displayName}\` sent command \`${interaction.commandName}\``
		);

	},
};
