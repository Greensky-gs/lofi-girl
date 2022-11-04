import { AudioPlayerStatus, createAudioResource } from '@discordjs/voice';
import { ApplicationCommandOptionType } from 'discord.js';
import ytdl from 'ytdl-core';
import voice from '../maps/voice';
import { LofiCommand } from '../structures/Command';
import { getQueue, getStation } from '../utils/functions';

export default new LofiCommand({
    name: 'station',
    description: 'Switch the music station',
    admin: false,
    dm: false,
    cooldown: 10,
    options: [
        {
            name: 'station',
            description: 'Station to switch with',
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true
        }
    ],
    execute: async ({ interaction, options }) => {
        const queue = getQueue(interaction);
        const station = getStation(options);

        if (!queue)
            return interaction
                .reply(
                    `:x: | To switch stations, I first need to be connected in a voice channel and playing some music`
                )
                .catch(() => {});

        if (
            queue.channel.members.filter((x) => !x.user.bot).size > 1 &&
            !interaction.member.permissions.has('Administrator')
        )
            return interaction
                .reply(`:x: | Since you're not alone in the voice channel, only administrators can change the music`)
                .catch(() => {});

        if (queue.url === station.url)
            return interaction
                .reply(`${station.emoji} | The music played is already **${station.name}**`)
                .catch(() => {});

        const rs = createAudioResource(ytdl(station.url, {
            filter: 'audioonly'
        }), {
            inlineVolume: true
        });
        rs.volume.setVolume(1);

        queue.player.play(rs);
        queue.ressource = rs;
        queue.url = station.url;

        voice.set(interaction.guild.id, queue);
        interaction.reply(`${station.emoji} | Station switched to ${station.name}`).catch(() => {});
    }
});
