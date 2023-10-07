const {
	SlashCommandBuilder,
	PermissionsBitField,
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require("discord.js");

const components = [
	{
		name: "Address",
		id: "address",
		maxLength: 300,
		minLength: 10,
		placeHolder: "123 Sesame St",
		style: TextInputStyle.Short,
		required: true,
	},
	{
		name: "Owners",
		id: "owners",
		maxLength: 50,
		minLength: 3,
		placeHolder: "John Doe, Jane Doe",
		style: TextInputStyle.Short,
		required: false,
	},
	{
		name: "Email",
		id: "email",
		maxLength: 50,
		minLength: 5,
		placeHolder: "example@example.com",
		style: TextInputStyle.Short,
		required: false,
	},
	{
		name: "Phone Number",
		id: "phone",
		maxLength: 20,
		minLength: 9,
		placeHolder: "Phone number",
		style: TextInputStyle.Short,
		required: false,
	},
	{
		name: "Notes",
		id: "notes",
		maxLength: 500,
		minLength: 0,
		placeHolder: "Notes: ",
		style: TextInputStyle.Paragraph,
		required: false,
	},
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName("modal")
		.setDescription("test modal"),

	args: [],
	permissions: [],

	async execute(interaction) {
		const modal = new ModalBuilder()
			.setCustomId("myModal")
			.setTitle("My Modal");

		for (const inputData of components) {
			const input = new TextInputBuilder()
				.setCustomId(inputData.id)
				.setLabel(inputData.name)
				.setStyle(inputData.style)
				.setPlaceholder(inputData.placeHolder)
				.setMaxLength(inputData.maxLength)
				.setMinLength(inputData.minLength)
				.setRequired(inputData.required);

			const actionRow = new ActionRowBuilder().addComponents(input);
			modal.addComponents(actionRow);
		}
		
		await interaction.showModal(modal);

		const submitted = await interaction
			.awaitModalSubmit({
				time: 60000,
				filter: (i) => i.user.id === interaction.user.id,
			})
			.catch((error) => {
				console.error(error);
				return null;
			});

		if (submitted) {
			console.log(submitted.fields)
			const [address, owners, email, phone, notes] = Object.keys(
				submitted.fields
			).map((key) =>
				console.log(key)
			);
			await submitted.reply({
				content: `Submitted`,
				ephemeral: true,
			});
		}

	},
};
