import { AmethystCommand, preconditions } from 'amethystjs';
import { ApplicationCommandOptionType } from 'discord.js';
import adminIfNotAlone from '../preconditions/adminIfNotAlone';
import playing from '../preconditions/playing';

export default new AmethystCommand({
    name: 'volume',
    description: 'Set the volume of the music player',
    preconditions: [preconditions.GuildOnly, playing, adminIfNotAlone],
    options: [
        {
            name: 'volume',
            description: 'Amount of the volume',
            minValue: 0,
            maxValue: 100,
            type: ApplicationCommandOptionType.Integer,
            required: true
        }
    ]
}).setChatInputRun(({ interaction, options }) => {
    const amount = options.get('volume').value as number;
    interaction.client.player.getQueue(interaction.guild).setVolume(amount);

    interaction.reply(`🔊 | Volume set to **${amount}%**`).catch(() => {});
});
