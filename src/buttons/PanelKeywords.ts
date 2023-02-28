import { ButtonHandler, waitForInteraction, waitForMessage } from "amethystjs";
import { PanelIds } from "../typings/bot";
import botOwner from "../preconditions/botOwner";
import { boolEmojis, row } from "../utils/functions";
import { ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, Message, StringSelectMenuBuilder, TextChannel } from "discord.js";
import configs from '../utils/configs.json'
import { writeFileSync } from "fs";

export default new ButtonHandler({
    customId: PanelIds.Keywords,
    preconditions: [botOwner]
}).setRun(async ({ button, message, user }) => {
    const components = message.components[0].components.map(x => new ButtonBuilder(x.toJSON()));
    components[3].setDisabled(true);

    message.edit({
        components: [
            row(...components)
        ]
    }).catch(() => {});

    const msg = await button.reply({
        fetchReply: true,
        content: `What action do you want to do ?`,
        components: [
            row(
                new ButtonBuilder()
                    .setLabel('Add')
                    .setCustomId(PanelIds.AddKeyword)
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel('List')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(PanelIds.KeywordsList),
                new ButtonBuilder()
                    .setLabel('Remove')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(PanelIds.RemoveKeyword),
                new ButtonBuilder()
                    .setLabel('Cancel')
                    .setCustomId('cancel')
                    .setStyle(ButtonStyle.Danger)
            )
        ]
    }).catch(() => {}) as Message<true>;

    const rep = await waitForInteraction({
        message: msg,
        componentType: ComponentType.Button,
        user
    }).catch(() => {});

    const reedit = () => {
        components[3].setDisabled(false);
        message.edit({
            components: [ row(...components) ]
        })
    }
    if (!rep || rep.customId === 'cancel') {
        reedit();
        return msg.delete().catch(() => {});
    }
    if (rep.customId === PanelIds.AddKeyword) {
        rep.deferUpdate().catch(() => {});
        await msg.edit({
            content: `What is the keyword you want to add ?\nReply in the chat\nReply by \`cancel\` to cancel`,
            components: []
        }).catch(() => {});

        const keyword = await waitForMessage({
            channel: message.channel as TextChannel,
            user
        }).catch(() => {});

        if (keyword) keyword.delete().catch(() => {});
        if (!keyword || keyword.content?.toLowerCase() === 'cancel') {
            reedit();
            return msg.delete().catch(() => {});
        }
        const word = keyword.content.split(/ +/)[0];
        if (!word) {
            reedit();
            msg.edit(`:x: | No keyword found`).catch(() => {});
            return setTimeout(() => {
                msg.delete().catch(() => {});
            }, 5000);
        }
        if (configs.testKeywords.includes(word.toLowerCase())) {
            reedit();
            msg.edit(`:x: | Already exists`).catch(() => {});
            return setTimeout(() => {
                msg.delete().catch(() => {});
            }, 5000);
        }

        configs.testKeywords.push(word.toLowerCase());
        writeFileSync('./dist/utils/configs.json', JSON.stringify(configs, null, 4));

        reedit();
        msg.edit({
            content: `${boolEmojis(true)} | Keyword added`,
            components: [row(new ButtonBuilder().setLabel('Delete message').setStyle(ButtonStyle.Danger).setCustomId('delete-message'))]
        }).catch(() => {});
        return;
    }
    if (rep.customId === PanelIds.KeywordsList) {
        reedit();
        const embed = new EmbedBuilder()
            .setTitle("Keyword")
            .setThumbnail(message.client.user.displayAvatarURL())
            .setTimestamp()
            .setColor(message.guild.members.me.displayHexColor)
            .setDescription(`There are **${configs.testKeywords.length.toLocaleString()}** keywords :\n${configs.testKeywords.map(x => `\`${x}\``).join(' ')}`)

        rep.deferUpdate().catch(() => {});
        msg.edit({
            embeds: [ embed ],
            components: [ row(new ButtonBuilder().setLabel('Delete').setCustomId('delete-message').setStyle(ButtonStyle.Danger)) ],
            content: `Keywords`
        }).catch(() => {})
        return
    }
    if (rep.customId === PanelIds.RemoveKeyword) {
        rep.deferUpdate().catch(() => {});
        await msg.edit({
            components: [
                row<StringSelectMenuBuilder>(new StringSelectMenuBuilder()
                    .setCustomId('keyword-delete-selector')
                    .setOptions(configs.testKeywords.map(x => ({ label: x[0].toUpperCase() + x.slice(1), description: `Delete keyword ${x}`, value: x })))
                    .setMaxValues(configs.testKeywords.length)
                )
            ],
            content: `Wich keyword(s) do you want to delete ?`
        }).catch(() => {});

        const reply = await waitForInteraction({
            componentType: ComponentType.StringSelect,
            message: msg,
            user
        }).catch(() => {});
        if (!reply) {
            reedit();
            return msg.delete().catch(() => {});
        };
        await reply.deferUpdate().catch(() => {});
        await msg.edit({
            content: `Are you sure that you want to delete ${reply.values.map(x => `\`${x}\``).join(' ')} ?`,
            components: [
                row(
                    new ButtonBuilder()
                        .setLabel('Yes')
                        .setStyle(ButtonStyle.Success)
                        .setCustomId('yes'),
                    new ButtonBuilder()
                        .setLabel('No')
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId('no')
                )
            ]
        }).catch(() => {});
        const confirmation = await waitForInteraction({
            componentType: ComponentType.Button,
            user,
            message: msg
        }).catch(() => {});
        if (!confirmation || confirmation.customId === 'no') {
            reedit();
            return msg.delete().catch(() => {});
        }

        configs.testKeywords = configs.testKeywords.filter(x => !reply.values.includes(x));
        writeFileSync('./dist/utils/configs.json', JSON.stringify(configs, null, 4));

        msg.edit({
            components: [],
            content: `${boolEmojis(true)} | The keyword(s) ${reply.values.map(x => `\`${x}\``).join(' ')} have been removed`
        }).catch(() => {})
        reedit();
        setTimeout(() => {
            msg.delete().catch(() => {})
        }, 5000);
        return
    }
})