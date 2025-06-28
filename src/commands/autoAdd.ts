import { AmethystCommand, log4js, preconditions } from "amethystjs";
import { buildLocalizations } from "../utils/functions";
import connected from "../preconditions/connected";
import playing from "../preconditions/playing";
import adminIfNotAlone from "../preconditions/adminIfNotAlone";
import { players } from "../cache/players";

const locals = buildLocalizations('autoadd')
export default new AmethystCommand({
    name: 'autoadd',
    description: "Toggle auto music adding at the end of a music",
    preconditions: [preconditions.GuildOnly, connected, playing, adminIfNotAlone],
    nameLocalizations: locals.name,
    descriptionLocalizations: locals.description
}).setChatInputRun(async({ interaction, client }) => {
    const data = players.get(interaction.guild.id);
    data.looping = !data.looping;

    players.set(interaction.guild.id, data);
    interaction.reply(client.langs.getText(interaction, 'autoAdd', 'reply', {
        state: client.langs.getText(interaction, 'autoAdd', data.looping ? 'positive' : 'negative')
    })).catch(log4js.trace)
})