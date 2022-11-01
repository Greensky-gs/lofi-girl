import { LofiCommand } from "../structures/Command";
import { EmbedBuilder } from 'discord.js';

export default new LofiCommand({
    name: 'help',
    description: "Displays help page",
    admin: false,
    cooldown: 5,
    dm: true,
    execute: ({ interaction }) => {
        const em = new EmbedBuilder()
            .setTimestamp()
            .setThumbnail(interaction.user.avatarURL({ forceStatic: false }))
            .setDescription(`Here is the list of my commands :\n${interaction.client.commands.sort((a, b) => (b.admin ? 0 : 1) - (a.admin ? 0 : 1)).map(c => `\`/${c.name}\` ${c.description}${c.admin ? ' **- admins only**':''}`).join('\n')}`)
            .setTitle('Help page')
            .setColor(interaction.guild?.members?.me?.displayHexColor ?? 'DarkAqua')
        interaction.reply({ embeds: [ em ] }).catch(() => {});
    }
})