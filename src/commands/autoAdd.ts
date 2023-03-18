import { AmethystCommand, preconditions } from 'amethystjs';
import adminIfNotAlone from '../preconditions/adminIfNotAlone';
import connected from '../preconditions/connected';
import playing from '../preconditions/playing';
import { buildLocalizations, getLoopState, setLoopState } from '../utils/functions';

const locals = buildLocalizations('autoadd');
export default new AmethystCommand({
    name: 'autoadd',
    description: 'Toggle auto music adding at the end of a music',
    preconditions: [preconditions.GuildOnly, connected, playing, adminIfNotAlone],
    nameLocalizations: locals.name,
    descriptionLocalizations: locals.description
}).setChatInputRun(({ interaction }) => {
    const state = !getLoopState(interaction.guild.id);
    setLoopState(interaction.guild.id, state);

    interaction.reply(interaction.client.langs.getText(interaction, 'autoAdd', 'reply', { state: interaction.client.langs.getText(interaction, 'autoAdd', state ? 'positive' : 'negative') })).catch(() => {});
});
