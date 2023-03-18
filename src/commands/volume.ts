import { AmethystCommand, preconditions } from 'amethystjs';
import { ApplicationCommandOptionType } from 'discord.js';
import adminIfNotAlone from '../preconditions/adminIfNotAlone';
import playing from '../preconditions/playing';
import { buildLocalizations } from '../utils/functions';

const locals = buildLocalizations('volume');
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
            required: true,
            nameLocalizations: locals.options.volume.name,
            descriptionLocalizations: locals.options.volume.description
        }
    ],
    nameLocalizations: locals.name,
    descriptionLocalizations: locals.description
}).setChatInputRun(({ interaction, options }) => {
    const amount = options.get('volume').value as number;
    interaction.client.player.nodes.get(interaction.guild).node.setVolume(amount);

    interaction.reply(interaction.client.langs.getText(interaction, 'volume', 'reply', { amount })).catch(() => {});
});
