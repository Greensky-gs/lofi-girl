import { ButtonHandler } from 'amethystjs';
import { TesterButtons } from '../typings/tester';
import isTester from '../preconditions/isTester';
import { EmbedBuilder } from 'discord.js';

export default new ButtonHandler({
    customId: TesterButtons.TesterCancel,
    preconditions: [isTester]
}).setRun(async ({ button, message, user }) => {
    message
        .edit({
            embeds: [new EmbedBuilder().setTitle(':bulb: Cancel').setColor('Yellow')],
            components: []
        })
        .catch(() => {});
});
