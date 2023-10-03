function upperCaseEveryWord(sentence) {
	return sentence
		.split(" ")
		.map((word) => {
			return word[0].toUpperCase() + word.substring(1);
		})
		.join(" ");
}

function getTeamName(id) {
	return id == "lbvz4f8cs2cwgsg"
		? "Smash"
		: id == "v799hjxptlm89pi"
		? "League"
		: "Rocket League";
}

module.exports = {
	upperCaseEveryWord: upperCaseEveryWord,
    getTeamName: getTeamName
};
