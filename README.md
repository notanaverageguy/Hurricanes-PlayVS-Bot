# Hurricanes-PlayVS-Bot

Offical Discord bot for the Hurricanes Esports team.

-   [Installation](#installation)
-   [Database setup](#database-setup)

## Installation

#### Fill [config file]('example config.json') and rename to config.json

### Node.js (via npm)

```sh
npm install
```

### Database collections setup (via [PocketBase](https://pocketbase.io/docs))

-   Launch pocketbase using ./pocketbase serve
-   Create first administrator profile
-   Go to settings -> import collections
-   Paste data found in [pb_schema.json](pb_schema.json)

## Usage

```sh
./pocketbase serve
node .
```

> This project does require you to have Node.JS installed
> Node.JS can be found [here](https://nodejs.org)
