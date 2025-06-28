import { AmethystCommand } from 'amethystjs';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { buildLocalizations } from '../utils/functions';

const locals = buildLocalizations('guide');
export default new AmethystCommand({
    name: 'guide',
    description: 'Display the guide of the bot',
    nameLocalizations: locals.name,
    descriptionLocalizations: locals.description
}).setChatInputRun(async ({ interaction }) => {
    await Promise.all([interaction.deferReply(), interaction.client.application.commands.fetch()]);

    const getCmd = (name: string) => {
        return `</${name}:${interaction.client.application.commands.cache.find((x) => x.name === name)?.id}>`;
    };

    const embed = new EmbedBuilder()
        .setTitle(interaction.client.langs.getText(interaction, 'guide', 'title'))
        .setColor('Orange')
        .setDescription(
            `${interaction.client.langs.getText(interaction, 'guide', 'intro')}\n\n${interaction.client.langs.getText(
                interaction,
                'guide',
                'playMusic',
                { play: getCmd('play') }
            )}\n\n${interaction.client.langs.getText(interaction, 'guide', 'recommendation', {
                play: getCmd('play')
            })}\n\n${interaction.client.langs.getText(interaction, 'guide', 'songAddition', {
                add: getCmd('add')
            })}\n\n${interaction.client.langs.getText(interaction, 'guide', 'autoadd', {
                autoadd: getCmd('autoadd')
            })}\n\n${interaction.client.langs.getText(interaction, 'guide', 'protip', {
                playing: getCmd('playing')
            })}\n\n${interaction.client.langs.getText(interaction, 'guide', 'feedback', {
                support: 'https://discord.gg/fHyN5w84g6',
                topgg: 'https://top.gg/bot/1037028318404419596',
                playing: getCmd('playing'),
                info: getCmd('info')
            })}`
        )
        .setThumbnail(interaction.client.user.displayAvatarURL());

    interaction
        .editReply({
            embeds: [embed],
            components: [
                new ActionRowBuilder().setComponents(
                    interaction.client.langs.getButton(interaction, 'deleteMessage', {
                        style: 'Danger',
                        id: 'delete-message'
                    })
                ) as ActionRowBuilder<ButtonBuilder>
            ]
        })
        .catch(() => {});
});
