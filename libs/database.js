const PocketBase = require("pocketbase/cjs");
const db = new PocketBase("http://127.0.0.1:8090");

async function calcPlayerWins(id) {
	const games = await db
		.collection("Games")
		.getFullList({
			filter: `players.id ?~ "${id}"`,
		})
		.catch(() => {
			console.log("couldnt find games");
			return;
		});

	const data = {
		games_played: 0,
		games_won: 0,
		games_lost: 0,
	};

	for (const game of games) {
		data.games_played++;
		if (game.won) {
			data.games_won++;
		} else {
			data.games_lost++;
		}
	}
	return await db.collection("Players").update(id, data);
}

async function calcGameScore(id) {
	const game = await db
		.collection("Games")
		.getOne(id)
		.catch(() => {
			return;
		});
	if(game.team == "lbvz4f8cs2cwgsg") {
		return game;
	}

	const rounds = await db
		.collection("Rounds")
		.getFullList({
			filter: `game.id = "${id}"`,
		})
		.catch(() => {
			console.log("couldnt find games");
			return;
		});

	const data = {
		wins: 0,
		losses: 0,
	};

	for (const round of rounds) {
		if (round.won) {
			data.wins++;
		} else {
			data.losses++;
		}
	}

	return await db.collection("Games").update(id, {
		score: `${data.wins} - ${data.losses}`,
		win: data.wins > data.losses,
	});
}

async function findPlayer(search) {
	var player = null;
	const search_terms = search.split(" ");
	if (search_terms.length == 1) {
		player = await db
			.collection("Players")
			.getOne(search)
			.catch(() => {
				return null;
			});
	}

	if (player) return player;
	if (search_terms.length == 1) {
		player = await db
			.collection("Players")
			.getFirstListItem(`first_name = '${search}'`)
			.catch(() => {
				return null;
			});

		if (!player) {
			player = await db
				.collection("Players")
				.getFirstListItem(`last_name = '${search}'`)
				.catch(() => {
					return null;
				});
		}
	} else if (search_terms.length == 2) {
		player = await db
			.collection("Players")
			.getFirstListItem(
				`first_name = '${search_terms[0]}' && last_name = '${search_terms[1]}'`
			)
			.catch(() => {
				return null;
			});
	}
	return player;
}

module.exports = {
	db: db,
	calcGameScore: calcGameScore,
	calcPlayerWins: calcPlayerWins,
	findPlayer: findPlayer,
};
