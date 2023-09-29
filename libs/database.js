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
            return
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
	const rounds = await db
		.collection("Rounds")
		.getFullList({
			filter: `game.id = "${id}"`,
		})
		.catch(() => {
			return console.log("couldnt find games");
		});
    
    const data = {
        wins: 0,
        losses: 0,
    }

    for(const round of rounds) {
        if(round.won) {
            data.wins ++;
        } else {
            data.losses ++;
        }
    }

    await db.collection("Games").update(id, {score: `${data.wins} - ${data.losses}`});
}

module.exports = {
	db: db,
    calcGameScore: calcGameScore,
    calcPlayerWins: calcPlayerWins,
};
