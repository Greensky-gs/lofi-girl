import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import voice from '../maps/voice';
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
        const v = voice.get(interaction.guild.id);
        const chan = (interaction.member as GuildMember)?.voice?.channel;
        
        if (!queue && !v) return interaction.reply(`:x: | I'm not playing music in a channel`).catch(() => {});
        if (!chan || chan.id !== (queue?.connection?.channel.id || v.connection.joinConfig.channelId)) return interaction.reply(`:x: | You must be in the voice channel to change the volume`).catch(() => {});

        if (
            chan.members.filter((m) => !m.user.bot).size >= 2 &&
            !(interaction.member as GuildMember).permissions.has('Administrator')
        )
            return interaction
                .reply(`:x: | Since you're not alone in the channel, only administrators can modify volume`)
                .catch(() => {});

        if (queue) {
            queue.setVolume(value);
        } else {
            v.ressource.volume.setVolume(value / 100);
            v.player.play(v.ressource);
            voice.set(interaction.guild.id, v);
        }
        interaction.reply(`🎧 | Volume set to **${value}%**`).catch(() => {});
    }
});
