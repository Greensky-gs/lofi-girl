import { LofiCommand } from "../structures/Command";
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { boolEmojis } from "../utils/functions";

export default new LofiCommand({
    name: 'help',
    description: "Displays help page",
    admin: false,
    cooldown: 5,
    dm: true,
    options: [
        {
            name: 'command',
            description: "Command to display",
            autocomplete: true,
            required: false,
            type: ApplicationCommandOptionType.String
        }
    ],
    execute: ({ interaction, options }) => {
        const cmdName = options.getString('command');
        const em = new EmbedBuilder()
        .setTimestamp()
        .setColor(interaction.guild?.members?.me?.displayHexColor ?? 'DarkAqua')
        .setThumbnail(interaction.user.avatarURL({ forceStatic: false }))
        
        if (cmdName) {
            const cmd = interaction.client.commands.find(x => x.name === cmdName);
            em.setDescription(`Here are informations about ${cmd.name} command`)
            .setFields(
                {
                    name: 'Description',
                    value: cmd.description,
                    inline: false
                },
                {
                    name: 'Admin only',
                    value: boolEmojis(cmd.admin),
                    inline: true
                },
                {
                    name: 'Cooldown',
                    value: cmd.cooldown + ' seconds',
                    inline: true
                },
                {
                    name: 'Executable in PM',
                    value: boolEmojis(cmd.dm),
                    inline: true
                }
            )
            .setTitle('Help command')
        } else {
            em
            .setDescription(`Here is the list of my commands :\n${interaction.client.commands.sort((a, b) => (b.admin ? 0 : 1) - (a.admin ? 0 : 1)).map(c => `\`/${c.name}\` ${c.description}${c.admin ? ' **- admins only**':''}`).join('\n')}`)
            .setTitle('Help page')

        }
        em.addFields(
            {
                name: 'links',
                value: `[**Invite Lofi Girl**](${interaction.client.inviteLink})\n[**Source code**](https://github.com/Greensky-gs/lofi-girl)\n[**Lofi Girl channel**](https://www.youtube.com/c/LofiGirl/)`
            }
        )

        interaction.reply({ embeds: [ em ] }).catch(() => {});
    }
})