import { AmethystCommand, preconditions } from 'amethystjs';
import adminIfNotAlone from '../preconditions/adminIfNotAlone';
import connected from '../preconditions/connected';
import { buildLocalizations } from '../utils/functions';
import { players, playlists } from '../cache/players';

const locals = buildLocalizations('leave');
export default new AmethystCommand({
    name: 'leave',
    description: 'Leave the voice channel',
    preconditions: [preconditions.GuildOnly, connected, adminIfNotAlone],
    nameLocalizations: locals.name,
    descriptionLocalizations: locals.description
}).setChatInputRun(({ interaction }) => {
    const data = players.get(interaction.guild.id)
    data.player.stop(true);
    data.connection.destroy();
    
    players.delete(interaction.guild.id)
    playlists.delete(interaction.guild.id);

    interaction.reply(interaction.client.langs.getText(interaction, 'leave', 'reply')).catch(() => {});
});
