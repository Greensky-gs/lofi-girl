import { AmethystCommand } from 'amethystjs';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { boolEmojis } from '../utils/functions';

export default new AmethystCommand({
    name: 'help',
    description: 'Displays help page',
    options: [
        {
            name: 'command',
            description: 'Command to show help',
            required: false,
            autocomplete: true,
            type: ApplicationCommandOptionType.String
        }
    ],
    cooldown: 5
}).setChatInputRun(({ interaction, options }) => {
    const cmd: AmethystCommand = interaction.client.chatInputCommands.find(
        (x) => x.options.name === options.getString('command')
    );
    if (cmd) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${cmd.options.name} command`)
                    .setDescription(cmd.options.description)
                    .setFields(
                        {
                            name: 'Permissions',
                            value: cmd.options.preconditions?.find((x) => x.name === 'adminIfNotAlone')
                                ? 'Administrator if user is not alone in the channel'
                                : '',
                            inline: false
                        },
                        {
                            name: 'Usable in direct messages',
                            value: boolEmojis(
                                !(cmd.options.preconditions?.find((x) => x.name === 'GuildOnly') ?? false)
                            ),
                            inline: true
                        }
                    )
                    .setColor('Orange')
                    .setThumbnail(interaction.client.user.displayAvatarURL({ forceStatic: true }))
            ]
        });
    }
    const commands = interaction.client.chatInputCommands.map((x) => x.options);

    const embed = new EmbedBuilder()
        .setTitle('Help page')
        .setDescription(
            `Here is the list of my commands :\n${commands.map((c) => `\`/${c.name}\` : ${c.description}`).join('\n')}`
        )
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setColor(interaction.client.user.hexAccentColor ?? 'Orange')
        .setTimestamp()
        .addFields({
            name: 'More help',
            value: `If you need more help, use the command \`/guide\``,
            inline: false
        });

    interaction.reply({ embeds: [embed] }).catch(() => {});
});
