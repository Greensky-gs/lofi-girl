
# lofi-girl

[Lofi girl](https://bit.ly/430zKch) bot's source code

This repository is the source code of [Lofi Girl](https://bit.ly/430zKch) bot

The bot uses [Amethyst JS framework](https://npmjs.com/package/amethystjs)

## Links

Here are the usefull links for [Lofi Girl](https://top.gg/bot/1037028318404419596) :

* [Top.gg page](https://top.gg/bot/1037028318404419596/)
* [Bot invitation](https://bit.ly/430zKch)
* [Support server](https://discord.gg/fHyN5w84g6)

## Important informations

There's some important informations you need to know :

* This bot isn't the official bot of [Lofi Channel](https://youtube.com/c/LofiGirl), I'm not affiliate with [Lofi Channel](https://youtube.com/c/LofiGirl) in any way
* For now the bot is still in developpement
* The code is open source and you can use it as you want

## Installation

If you want to use it in a personnal usage, first download yarn (if you don't have, run `npm i -g yarn`)

Then you need to install the dependencies : `yarn install`

See [`./env.example`](./.env.example) to see what the `.env` file should look like

Create a `.env` file that includes :

```env
token=Your bot's token
feedback=feedback webhook URL
botOwner=your discord ID
suggestChannel=music suggestions channel (for bot Owner)
botPrefix=bot prefix (default is lf!)
panelChannel=ID of panel channel for the owner
```

Compile the project : `yarn run build`

And start the bot : `yarn run start`

### Command

There's a npm script that you can use to check if the `configs.json` file contains duplicated files

Use `node run duplicates` in the command prompt to run the script.

The script will build the project and check for duplicates.

If a station is duplicated, it will throw an error.

## Panel

There is a panel to control the bot

It will be sent in the channel defined by the `panelChannel` field in [`.env`](./.env.example) file
![panel](https://media.discordapp.net/attachments/1062408280191807581/1082330474485137528/image.png)
