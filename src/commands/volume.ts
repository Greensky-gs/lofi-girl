import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { LofiCommand } from '../structures/Command';

export default new LofiCommand({
    name: 'volume',
    description: 'Set the volume',
    dm: false,
    admin: false,
    cooldown: 10,
    options: [
        {
            name: 'volume',
            description: 'Volume value you want to give',
            maxValue: 100,
            minValue: 0,
            required: true,
            type: ApplicationCommandOptionType.Integer
        }
    ],
    execute: async ({ interaction, options }) => {
        const value = options.get('volume').value as number;
        const queue = interaction.client.player.getQueue(interaction.guild);
        if (!queue) return interaction.reply(`:x: | I'm not playing music in a channel`).catch(() => {});
        if (
            queue.connection.channel.members.filter((m) => !m.user.bot).size >= 2 &&
            !(interaction.member as GuildMember).permissions.has('Administrator')
        )
            return interaction
                .reply(`:x: | Since you're not alone in the channel, only administrators can modify volume`)
                .catch(() => {});

        queue.setVolume(value);
        interaction.reply(`🎧 | Volume set to **${value}%**`).catch(() => {});
    }
});
