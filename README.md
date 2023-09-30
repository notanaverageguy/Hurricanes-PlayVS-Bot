# Hurricanes-PlayVS-Bot
Offical Discord bot for the Hurricanes Esports team.

- [Installation](#installation)
- [Database setup](#database-setup)

## Installation

### Node.js (via npm)

```sh
npm install
```

### Database setup (via [PocketBase](https://pocketbase.io/docs))

This section will be divided into the collections we are working on. 

#### Teams

> All API rules are public
- name: string
- players: number
- captains: number

#### Players

> All API rules are public
- first_name: string
- last_name: string
- role: string
- team: singular relationship with Teams
- games_played: numer
- games_won: number
- games_lost: number

#### Games

> All API rules are public
- opponent: string
- score: string
- win: boolean
- team: singular relationship with Teams
- players: multiple relationship with Players
- played: datetime

#### Rounds

> All API rules are public
- opponent: string
- score: string
- win: boolean
- game: singular relationship with Games
- players: multiple relationship with Players
- played: datetime

## Usage
```sh
node .
```
> This project does require you to have Node.JS installed
> Node.JS can be found [here](https://nodejs.org)
