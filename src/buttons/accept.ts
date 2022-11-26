import { ButtonHandler } from 'amethystjs';
import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { writeFileSync } from 'fs';
import botOwner from '../preconditions/botOwner';
import confs from '../utils/configs.json';

export default new ButtonHandler({
    customId: 'accept',
    preconditions: [botOwner]
}).setRun(async ({ button, message }) => {
    const data = {
        title: button.message.embeds[0].title,
        url: button.message.embeds[0].url
    };

    const beats = data.title.split(/lofi( +)hip( +)hop( +)/i)[1] ?? 'no beats found)';
    const modal = new ModalBuilder()
        .setCustomId('accept-modal')
        .setTitle('Station data')
        .setComponents(
            new ActionRowBuilder({
                components: [
                    new TextInputBuilder()
                        .setCustomId('a.name')
                        .setLabel('Name')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder(data.title)
                        .setRequired(true)
                ]
            }),
            new ActionRowBuilder({
                components: [
                    new TextInputBuilder()
                        .setCustomId('a.author')
                        .setLabel('Music author(s)')
                        .setValue(data.title.split('-')[0] ?? 'No author found')
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                ]
            }),
            new ActionRowBuilder({
                components: [
                    new TextInputBuilder()
                        .setCustomId('a.beats')
                        .setLabel('Beats')
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                        .setValue(beats.substring(0, beats.length - 1))
                ]
            }),
            new ActionRowBuilder({
                components: [
                    new TextInputBuilder()
                        .setCustomId('a.emoji')
                        .setLabel('Emoji')
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('Emoji')
                ]
            })
        );

    await button.showModal(modal).catch(() => {});
    const reply = await button
        .awaitModalSubmit({
            time: 300000
        })
        .catch(() => {});

    console.log(reply);
    if (!reply) return;
    const g = (x: string) => reply.fields.getTextInputValue(`a.${x}`);
    const title = g('name');
    const beatsV = `(lofi hip hop/${g('beats')})`;
    const emoji = g('emoji');
    const authors = g('author');

    confs.stations.push({
        url: data.url,
        name: `${authors} - ${title} ${beatsV}`,
        type: 'playlist',
        emoji
    });
    writeFileSync(
        `./${__filename.endsWith('.ts') ? 'src' : 'dist'}/utils/configs.json`,
        JSON.stringify(confs, null, 4)
    );

    reply
        .reply({
            content: `🎧 | Music added`,
            ephemeral: true
        })
        .catch(() => {});
    const sender = button.client.users.cache.get(button.message.components[0].components[2].customId);
    sender
        .send(`🎧 | Your [suggestion](${data.url}) has been accepted !\nThank you for submitting a music`)
        .catch(() => {});

    message.edit({ components: [], content: `Music added` }).catch(() => {});
});
