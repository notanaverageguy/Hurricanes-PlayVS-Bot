module.exports = {
	name: "interactionCreate",
	once: false,
	execute(client, interaction) {

		//Logging to channel
		const auditChannel = client.channels.cache.get("1158227537181294593");
		auditChannel.send(
			`\`${interaction.user.displayName}\` sent command \`${interaction.commandName}\``
		);

	},
};
