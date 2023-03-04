
# lofi-girl

[Lofi girl](https://discord.com/oauth2/authorize?client_id=1037028318404419596&permissions=277028554752&scope=bot%20applications.commands) bot's source code

This repository is the source code of [Lofi Girl](https://discord.com/oauth2/authorize?client_id=1037028318404419596&permissions=277028554752&scope=bot%20applications.commands) bot

The bot uses [Amethyst JS framework](https://npmjs.com/package/amethystjs)

## Links

Here are the usefull links for [Lofi Girl](https://top.gg/bot/1037028318404419596) :

* [Top.gg page](https://top.gg/bot/1037028318404419596/)
* [Bot invitation](https://discord.com/oauth2/authorize?client_id=1037028318404419596&permissions=277028554752&scope=bot%20applications.commands)
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
```

Compile the project : `yarn run build`

And start the bot : `yarn run start`

### Command

There's a npm script that you can use to check if the `configs.json` file contains duplicated files

Use `node run duplicates` in the command prompt to run the script.

The script will build the project and check for duplicates.

If a station is duplicated, it will throw an error.

## Special command for owner

If you're the bot owner, you can set a station recommendation by using the command `{botPrefix}recommendation <station url>`

*Exemple :*

```cmd
!recommendation https://www.youtube.com/watch?v=Mu3BfD6wmPg
```

## Get configs file

The bot can add songs by a suggestions system.

However, if you want to get the `configs.json` file, use the command `{botPrefix}configfile`.

*Exemple :*

```cmd
!configfile
```

This will tell him to send you the config file in direct messages and delete the message command

## Panel

There is a panel to control the bot

It will be sent in the channel defined by the `panelChannel` field in [`.env`](./.env.example) file
![panel](https://media.discordapp.net/attachments/1062408280191807581/1081569481589014649/image.png)
