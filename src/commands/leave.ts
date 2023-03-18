import { AmethystCommand, preconditions } from 'amethystjs';
import adminIfNotAlone from '../preconditions/adminIfNotAlone';
import connected from '../preconditions/connected';
import { buildLocalizations } from '../utils/functions';

const locals = buildLocalizations('leave');
export default new AmethystCommand({
    name: 'leave',
    description: 'Leave the voice channel',
    preconditions: [preconditions.GuildOnly, connected, adminIfNotAlone],
    nameLocalizations: locals.name,
    descriptionLocalizations: locals.description
}).setChatInputRun(({ interaction }) => {
    interaction.client.player.nodes.get(interaction.guild).delete();
    interaction.reply(interaction.client.langs.getText(interaction, 'leave', 'reply')).catch(() => {});
});
