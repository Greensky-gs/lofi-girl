import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import moment from 'moment';
import { getBasicInfo } from 'ytdl-core';
import { LofiCommand } from '../structures/Command';
import { station as st } from '../typings/station';
import { stations } from '../utils/configs.json';
import { getStation } from '../utils/functions';

export default new LofiCommand({
    name: 'info',
    description: 'Displays some informations',
    dm: true,
    admin: false,
    cooldown: 5,
    options: [
        {
            name: 'bot',
            description: 'Displays bot informations',
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: 'station',
            description: "Show a station's informations",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'station',
                    autocomplete: true,
                    required: true,
                    description: 'Station to display',
                    type: ApplicationCommandOptionType.String
                }
            ]
        }
    ],
    execute: async ({ interaction, options }) => {
        const cmd = options.getSubcommand(true);
        if (cmd === 'station') {
            const station = getStation(options) as st;
            await interaction.deferReply();
            const track = await getBasicInfo(station.url);

            const em = new EmbedBuilder()
                .setTitle(`${station.emoji} ${station.name}`)
                .setURL(station.url)
                .setFields({
                    name: 'Duration',
                    value: (station.type === 'station' ? 'Live' : `~${Math.floor(parseInt(track.videoDetails.lengthSeconds) / 1000)} minutes`) ?? 'Unknown',
                    inline: false
                })
                .setColor('DarkGreen')
                .setThumbnail(
                    track.thumbnail_url ?? interaction.client.user.displayAvatarURL({ forceStatic: false })
                );

            interaction.editReply({ embeds: [em] }).catch(() => {});
        }
        if (cmd === 'bot') {
            await Promise.all([interaction.deferReply(), interaction.client.guilds.fetch()]);
            const members = interaction.client.guilds.cache.map((g) => g.memberCount).reduce((a, b) => a + b);

            const em = new EmbedBuilder()
                .setTitle('Bot informations')
                .setURL('https://github.com/Greensky-gs/lofi-girl')
                .setDescription(`Here are some informations about me`)
                .setFields(
                    {
                        name: 'Servers',
                        value: interaction.client.guilds.cache.size.toString(),
                        inline: true
                    },
                    {
                        name: 'Members',
                        value: members.toString(),
                        inline: true
                    },
                    {
                        name: 'Stations',
                        value: `${stations.length} music stations`,
                        inline: true
                    },
                    {
                        name: 'Uptime',
                        value: 'Last connected ' + moment(Date.now() - interaction.client.uptime).fromNow(),
                        inline: false
                    },
                    {
                        name: 'Links',
                        value: `[Source code](https://github.com/Greensky-gs/lofi-girl)\n[Invite me](${interaction.client.inviteLink})\n[Lofi Girl Channel](https://youtube.com/c/LofiGirl)`,
                        inline: false
                    }
                )
                .setColor('DarkGreen');

            interaction
                .editReply({
                    embeds: [em]
                })
                .catch(() => {});
        }
    }
});
