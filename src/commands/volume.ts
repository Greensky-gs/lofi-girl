import { ApplicationCommandOptionType } from 'discord.js';
import voice from '../maps/voice';
import { LofiCommand } from '../structures/Command';
import { getQueue } from '../utils/functions';

export default new LofiCommand({
    name: 'volume',
    description: 'Manage volume on Lofi Girl',
    dm: false,
    admin: false,
    cooldown: 5,
    options: [
        {
            name: 'volume',
            description: 'Volume to set',
            type: ApplicationCommandOptionType.Integer,
            maxValue: 100,
            minValue: 0,
            required: true
        }
    ],
    execute: async ({ interaction, options }) => {
        const queue = getQueue(interaction.guild.id);
        if (!queue) return interaction.reply(`:x: | I'm not connected to a voice channel`).catch(() => {});

        if (
            queue.channel.members.filter((x) => !x.user.bot).size > 1 &&
            !interaction.member.permissions.has('Administrator')
        )
            return interaction
                .reply(`:x: | Since you're not alone in the channel, only administrators can change the volume`)
                .catch(() => {});

        const value = options.get('volume', true).value as number;
        queue.ressource.volume.setVolume(value / 100);

        queue.player.play(queue.ressource);
        voice.set(interaction.guild.id, queue);

        interaction.reply(`🎧 | Set the volume to **${value}%**`);
    }
});
