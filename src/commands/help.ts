import { AmethystCommand } from 'amethystjs';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { boolEmojis, buildLocalizations } from '../utils/functions';

const locals = buildLocalizations('help');
export default new AmethystCommand({
    name: 'help',
    description: 'Displays help page',
    options: [
        {
            name: 'command',
            description: 'Command to show help',
            required: false,
            autocomplete: true,
            type: ApplicationCommandOptionType.String,
            nameLocalizations: locals.options.command.name,
            descriptionLocalizations: locals.options.command.description
        }
    ],
    cooldown: 5,
    nameLocalizations: locals.name,
    descriptionLocalizations: locals.description
}).setChatInputRun(({ interaction, options }) => {
    const cmd: AmethystCommand = interaction.client.chatInputCommands.find(
        (x) => x.options.name === options.getString('command')
    );
    if (cmd) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        interaction.client.langs.getText(interaction, 'help', 'commandEmbedTitle', {
                            commandName: locals.name[interaction.locale] ?? cmd.options.name
                        })
                    )
                    .setDescription(locals.description[interaction.locale] ?? cmd.options.description)
                    .setFields(
                        {
                            name: interaction.client.langs.getText(interaction, 'help', 'permissionsName'),
                            value: cmd.options.preconditions?.find((x) => x.name === 'adminIfNotAlone')
                                ? interaction.client.langs.getText(interaction, 'help', 'adminIfNotAlone')
                                : '',
                            inline: false
                        },
                        {
                            name: interaction.client.langs.getText(interaction, 'help', 'GuildOnly'),
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
        .setTitle(interaction.client.langs.getText(interaction, 'help', 'help'))
        .setDescription(
            interaction.client.langs.getText(interaction, 'help', 'description', {
                list: commands
                    .map(
                        (c) =>
                            `${c.nameLocalizations[interaction.locale] ?? c.name}\` : ${
                                c.descriptionLocalizations[interaction.locale] ?? c.description
                            }`
                    )
                    .join('\n')
            })
        )
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setColor(interaction.client.user.hexAccentColor ?? 'Orange')
        .setTimestamp()
        .addFields({
            name: interaction.client.langs.getText(interaction, 'help', 'more'),
            value: interaction.client.langs.getText(interaction, 'help', 'moreValue'),
            inline: false
        });

    interaction.reply({ embeds: [embed] }).catch(() => {});
});
