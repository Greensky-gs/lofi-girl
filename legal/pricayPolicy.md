# Privacy Policy

## Usage of Data

Server ID and user are stored in cache, that cannot be accessed while the bot is running, and are deleted when the bot is offline.
Only song testers' ID are stored in a file in order to recognize who can send feedback on the bot.

## Stored data

The bot may store the following informations automatically when being asked to play a music in a channel :

Server ID : The ID of the server where the music is played in order to recognize wich server has auto-addition (song) system enabled (so a boolean values is associated to this ID)
User : The user (stored as a [Discord user object in javascript](https://discord.js.org/#/docs/discord.js/14.7.1/class/User)) in order to recognize who asked the music to potentially ask his feedback at the end.

Both of these informations are stored in cache and cannot be accessed when bot is online and are automatically deleted when the bot is offline.

The bot can store User ID when someone ask the owner of the bot to be added as a song tester and the owner accepts it. Only its user ID and the feedback request frequence (wich is a text that can be only theses values : `songend`, `oninfo`, `onstationinfo`, `onplayinginfo` and `everytime` ) are stored.

## Updating data

In the case of cached datas, only the value of the Server ID can be updated when the user uses the command `/autoadd`, wich edit the given boolean value for this ID.
In the case of the testers' ID, the ID cannot be edited while the bot is online, but it can be modified in the config file when it is offline.

## Removing data

The cached datas, as described above, are deleted when the bot goes offline (so Server ID and user are deleted when the bot disconnects from Discord).

The testers' ID are stored in a config file, so they are not deleted when the bot goes offline. However, the controler of the bot can delete these datas while the bot is online by using the control panel, wich allows him to manage datas of the bot (testers ID, available musics, feedbacks given about the songs).
In order to remove their data, the testers can ask the bot owner to remove them, by the [support server](https://discord.gg/fHyN5w84g6), wich is a guaranteed contact way, or by any other provided contact ways, but they are not guaranteed.