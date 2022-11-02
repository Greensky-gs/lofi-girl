import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { LofiCommand } from '../structures/Command';
import { stations } from '../utils/configs.json';
import { station } from '../typings/station';
import { Player } from 'discord-player';

export default new LofiCommand({
    name: 'play',
    description: 'Join your voice channel and starts playing lofi music',
    options: [
        {
            name: 'station',
            description: 'Play a specific station',
            required: false,
            autocomplete: true,
            type: ApplicationCommandOptionType.String
        }
    ],
    admin: false,
    dm: false,
    cooldown: 5,
    execute: async ({ interaction, options }) => {
        const station = (stations.find((x) => x.url === options.getString('station')) ?? stations[0]) as station;
        let queue = interaction.client.player.getQueue(interaction.guild);
        if (!queue) {
            interaction.client.player.createQueue(interaction.guild, {
                metadata: {
                    channel: interaction.channel
                },
                ytdlOptions: {
                    quality: 'highestaudio',
                    dlChunkSize: 0,
                    filter: 'audioonly',
                    highWaterMark: 1 << 30
                }
            });
            queue = interaction.client.player.getQueue(interaction.guild);
        }

        const channel = (interaction.member as GuildMember)?.voice?.channel;
        if (!channel) return interaction.reply(`:x: | You're not connected to a voice channel`).catch(() => {});
        if (queue.connection && !(interaction.member as GuildMember).permissions.has('Administrator'))
            return interaction
                .reply(`:x: | Sorry, only administrators can, change the music or the music channel`)
                .catch(() => {});

        await interaction.deferReply();

        const tracks = await interaction.client.player
            .search(station.url, {
                requestedBy: interaction.user
            })
            .catch(console.log);

        if (!tracks || tracks.tracks.length === 0)
            return interaction
                .editReply(
                    `:x: | An error occured, I can't find the music.\n> Please contact my developper if it happens again.`
                )
                .catch(() => {});
        console.log(tracks.tracks[0]);
        if (!queue.connection) await queue.connect(channel);
        await queue.play(tracks.tracks[0], {
            immediate: true
        });

        interaction.editReply(`${station.emoji} | Playing ${station.name}`).catch(() => {});
    }
});
