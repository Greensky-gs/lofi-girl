import { AmethystCommand, waitForInteraction } from 'amethystjs';
import botOwner from '../preconditions/botOwner';
import deleteCommand from '../preconditions/deleteCommand';
import { getTester, row } from '../utils/functions';
import { ButtonBuilder, ButtonStyle, ComponentType, Message } from 'discord.js';
import confs from '../utils/configs.json';
import { writeFileSync } from 'fs';

export default new AmethystCommand({
    name: 'tester',
    description: 'Manage testers',
    preconditions: [botOwner, deleteCommand]
}).setMessageRun(async ({ message, options }) => {
    if (options.first === 'add') {
        const id = options.second || message?.mentions.users?.first()?.id;
        if (!id)
            return message.channel.send(`:x: | No ID found. Please try again with an ID or a mention`).catch(() => {});
        const select = (await message.channel
            .send({
                content: `When do you want to be notified ?`,
                components: [
                    row(
                        new ButtonBuilder()
                            .setLabel('Every time')
                            .setStyle(ButtonStyle.Success)
                            .setCustomId('everytime'),
                        new ButtonBuilder().setLabel('Song end').setStyle(ButtonStyle.Primary).setCustomId('songend'),
                        new ButtonBuilder()
                            .setLabel('Station information')
                            .setStyle(ButtonStyle.Primary)
                            .setCustomId('info'),
                        new ButtonBuilder().setLabel('Cancel').setStyle(ButtonStyle.Danger).setCustomId('cancel')
                    )
                ]
            })
            .catch(() => {})) as Message<true>;
        const rep = await waitForInteraction({
            message: select,
            user: message.author,
            componentType: ComponentType.Button
        }).catch(() => {});

        if (!rep || rep.customId === 'cancel') return select.delete()?.catch(() => {});
        const data = {
            id,
            when: rep.customId
        };

        const was = getTester(id) ? true : false;
        select.edit(`<@${id}> ${was ? 'added with' : 'edited to'} \`${rep.customId}\``).catch(() => {});

        if (was) {
            const index = confs.testers.indexOf(confs.testers.find((x) => x.id === id));
            confs.testers[index] = data;
        } else {
            confs.testers.push(data);
        }
        writeFileSync('dist/utils/configs.json', JSON.stringify(confs, null, 4));
    }
    if (options.first === 'remove') {
        const id = options.second || message?.mentions.users?.first()?.id;
        if (!id)
            return message.channel.send(`:x: | No ID found. Please try again with an ID or a mention`).catch(() => {});

        if (!getTester(id)) return message.channel.send(`<@${id}> is not a tester`).catch(() => {});
        const index = confs.testers.indexOf(confs.testers.find((x) => x.id === id));
        confs.testers.splice(index, 1);

        writeFileSync('dist/utils/configs.json', JSON.stringify(confs, null, 4));
        message.channel.send(`<@${id}> has been removed`).catch(() => {});
    }
});
