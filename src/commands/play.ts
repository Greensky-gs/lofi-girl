import { AmethystCommand, log4js, preconditions } from "amethystjs";
import { buildLocalizations, getRandomStation, resolveName } from "../utils/functions";
import connected from "../preconditions/connected";
import adminIfNotAlone from "../preconditions/adminIfNotAlone";
import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import { stations } from "../cache/stations";
import { AudioPlayer, joinVoiceChannel } from "@discordjs/voice";
import { buildResource, stateChange } from "../utils/playerUtils";
import { players } from "../cache/players";

const locals = buildLocalizations('play');
export default new AmethystCommand({
    name: 'play',
    description: "Plays a lofi music",
    nameLocalizations: locals.name,
    descriptionLocalizations: locals.description,
    preconditions: [preconditions.GuildOnly, connected, adminIfNotAlone],
    options: [
        {
            name: 'station',
            description: "The station to play",
            required: false,
            autocomplete: true,
            type: ApplicationCommandOptionType.String,
            nameLocalizations: locals.options.station.name,
            descriptionLocalizations: locals.options.station.description
        }
    ]
}).setChatInputRun(async({ interaction, client, options }) => {
    const station = options.getString('station', false);
    const object = stations[station] ?? getRandomStation();

    if (!object) return interaction.reply(client.langs.getText(interaction, 'utils', 'stationNotFound')).catch(log4js.trace);
    await interaction.deferReply().catch(log4js.trace);

    const resource = buildResource(object);

    const channel = (interaction.member as GuildMember).voice.channel;
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guildId,
        adapterCreator: channel.guild.voiceAdapterCreator
    })

    const audioPlayer = new AudioPlayer()
    connection.subscribe(audioPlayer);

    audioPlayer.play(resource)

    audioPlayer.on('stateChange', (o, n) => {
        stateChange(audioPlayer, o, n, channel.guild.id);
    })

    interaction.editReply(client.langs.getText(interaction, 'play', 'reply', {
        stationName: resolveName(object),
        stationEmoji: object.emoji,
        stationUrl: object.url,
        channelId: channel.id
    })).catch(log4js.trace);

    players.set(interaction.guild.id, {
        player: audioPlayer,
        connection,
        user: interaction.user.id,
        currentTrack: object,
        looping: false,
        paused: false,
        startedAt: Date.now()
    })
})