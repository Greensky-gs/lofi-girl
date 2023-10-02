import { ButtonHandler } from 'amethystjs';
import { ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { writeFileSync } from 'fs';
import botOwner from '../preconditions/botOwner';
import isNotAdded from '../preconditions/isNotAdded';
import confs from '../utils/configs.json';
import { findEmoji, row } from '../utils/functions';

export default new ButtonHandler({
    customId: 'accept',
    preconditions: [botOwner, isNotAdded]
}).setRun(async ({ button, message, client }) => {
    const data = {
        title: button.message.embeds[0].title,
        url: button.message.embeds[0].url
    };

    const beats = data.title.split(/lofi {0,}hip {0,}hop {0,}\//i)[1] ?? 'no beats found)';
    const modal = new ModalBuilder()
        .setCustomId('accept-modal')
        .setTitle(client.langs.getText(button, 'acceptButton', 'modalTitle'))
        .setComponents(
            row(
                    new TextInputBuilder()
                        .setCustomId('a.name')
                        .setLabel(client.langs.getText(button, 'acceptButton', 'nameName'))
                        .setStyle(TextInputStyle.Short)
                        .setValue((data.title.split('-')[1] ?? data.title).split('[')[0] ?? data.title)
                        .setRequired(true)
              
            ),
            row(
                    new TextInputBuilder()
                        .setCustomId('a.author')
                        .setLabel(client.langs.getText(button, 'acceptButton', 'authorName'))
                        .setValue(
                            data.title.split('-')[0] ??
                                client.langs.getText(button, 'acceptButton', 'authorNotFound')
                        )
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                ),
                row(
                    new TextInputBuilder()
                        .setCustomId('a.beats')
                        .setLabel(client.langs.getText(button, 'acceptButton', 'beatsName'))
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                        .setValue(
                            beats.substring(0, beats.length - 1).split(' ')[0] ?? beats.substring(0, beats.length - 1)
                        )
            ),
            row(
                    new TextInputBuilder()
                        .setCustomId('a.emoji')
                        .setLabel(client.langs.getText(button, 'acceptButton', 'emojiName'))
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                        .setValue(
                            findEmoji(data.title) ??
                                client.langs.getText(button, 'acceptButton', 'emojiDefaultValue')
                        )
                
            ),
            row(new TextInputBuilder()
                .setCustomId('a.type')
                .setLabel(client.langs.getText(button, 'acceptButton', 'stationType'))
                .setRequired(false)
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(client.langs.getText(button, 'acceptButton', 'stationTypePlaceholder'))
            )
        );

    await button.showModal(modal).catch(() => {});
    const reply = await button
        .awaitModalSubmit({
            time: 300000
        })
        .catch(() => {});

    if (!reply) return;
    const g = (x: string) => reply.fields.getTextInputValue(`a.${x}`);
    const title = g('name');
    const beatsV =
        g('beats') === 'sad'
            ? '(sad lofi hip hop)'
            : g('beats') === 'asian'
            ? '(asian lofi hip hop)'
            : `(lofi hip hop/${g('beats')} beats)`;
    const emoji = g('emoji');
    const authors = g('author');
    const type = g('type') === 'radio' ? 'radio' : 'playlist'

    const stationName = `${authors} - ${title} ${beatsV}`.replace(/ +/g, ' ');
    confs.stations.push({
        url: data.url,
        name: stationName,
        type,
        emoji,
        feedbacks: []
    });
    writeFileSync(
        `./${__filename.endsWith('.ts') ? 'src' : 'dist'}/utils/configs.json`,
        JSON.stringify(confs, null, 4)
    );
    client.api.update('stationAdd', {
        name: stationName,
        emitterId: '',
        emoji,
        url: data.url,
        type
    });

    reply
        .reply({
            content: client.langs.getText(button, 'acceptButton', 'added'),
            ephemeral: true
        })
        .catch(() => {});
    const sender = client.users.cache.get(button.message?.components[0]?.components[2]?.customId);
    if (sender)
        sender
            .send(`🎧 | Your [suggestion](${data.url}) has been accepted !\nThank you for submitting a music`)
            .catch(() => {});

    message
        .edit({ components: [], content: client.langs.getText(button, 'acceptButton', 'addedData') })
        .catch(() => {});
});
