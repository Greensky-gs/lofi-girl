
# lofi-girl

[Lofi girl](https://discord.com/oauth2/authorize?client_id=1037028318404419596&permissions=277028554752&scope=bot%20applications.commands) bot's source code

This repository is the source code of [Lofi Girl](https://discord.com/oauth2/authorize?client_id=1037028318404419596&permissions=277028554752&scope=bot%20applications.commands) bot

## Important informations

There's some important informations you need to know :

* This bot isn't the official bot of [Lofi Channel](https://youtube.com/c/LofiGirl), I'm not affiliate with [Lofi Channel](https://youtube.com/c/LofiGirl) in any way
* For now the bot is still in developpement
* The code is open source and you can use it as you want

## Installation

If you want to use it in a personnal usage, first download yarn (if you don't have, run `npm i -g yarn`)

Then you need to install the dependencies : `yarn install`

Create a `.env` file that includes :

```env
token=Your bot's token
feedback=feedback webhook URL
botOwner=your discord ID
suggestChannel=music suggestions channel (for bot Owner)
botPrefix=bot prefix
```

Compile the project : `yarn run build`

And start the bot : `yarn run start`

## Special command for owner

If you're the bot owner, you can set a station recommendation by using the command `{botPrefix}recommendation <station url>`

*Exemple :*

```cmd
!recommendation https://www.youtube.com/watch?v=Mu3BfD6wmPg
```

## Get configs file

The bot can add songs by a suggestions system.

However, if you want to get the `configs.json` file, send a message where you mention the bot.

This will tell him to send you the config file in direct messages

## Developement

As the bot still in developement, some features doesn't work very well like playing a live
