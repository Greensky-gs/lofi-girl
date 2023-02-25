import { AmethystCommand } from 'amethystjs';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export default new AmethystCommand({
    name: 'guide',
    description: 'Display the guide of the bot'
}).setChatInputRun(async ({ interaction }) => {
    await Promise.all([interaction.deferReply(), interaction.client.application.commands.fetch()]);

    const getCmd = (name: string) => {
        return `</${name}:${interaction.client.application.commands.cache.find((x) => x.name === name).id}>`;
    };

    const embed = new EmbedBuilder()
        .setTitle("Lofi Girl bot's guide")
        .setColor('Orange')
        .setDescription(
            `This is the guide of usage of Lofi Girl bot.\n\n**Play a music :**\nTo play a music on Lofi Girl, use the command ${getCmd(
                'play'
            )} followed by the song you want to listen. This option is optionnal. In case you don't provide a song, a random is picked up.\n\n**Recommendation system :**\nEvery day, my creator puts a song that he likes on the bot and you can listen to it by using the ${getCmd(
                'play'
            )} command.\nTo get the recommendation, start typing \`recommendation\` in the option text input.\nAn option called \`❤️ recommendation - get the recommendation of the day\` will pop up. Click on it to play the recommendation.\n\n**Song addition :**\nWhen you started to listen to a music, you can add other songs that will be played once the first is finished. Use the command ${getCmd(
                'add'
            )} to add a song.\n\n**Auto-addition song system :**\nWhen you've started to listen to a music, you may want to listen lofi music forever (understandable). I have this feature, use the command ${getCmd(
                'autoadd'
            )} to toggle the auto-song addition system.\n\n:bulb: *pro tip*\nWhen you are listening to a music, you may want to know what I'm playing. Use ${getCmd(
                'playing'
            )} to see it\n\n**Feedback system :**\nIf you want to get a feedback on a song, you can see it by using the ${getCmd('info')} command (using the \`/station sub-command\`), or the ${getCmd('playing')} command, and if a feedback has been set, it will appear.\nIf you want to make your own, you can become a song tester by contact my owner. You can do it by joining the [support server](https://discord.gg/fHyN5w84g6), or getting the link by our [top.gg page](https://top.gg/bot/1037028318404419596)`
        )
        .addFields({
            name: 'Suggestions',
            value: `If you have a suggestion of a Lofi music (from the [Lofi Channel](https://youtube.com/c/LofiGirl)), you can submit it to us.\nUse the command ${getCmd(
                'suggestion'
            )} to submit a song`,
            inline: false
        })
        .setThumbnail(interaction.client.user.displayAvatarURL());

    interaction
        .editReply({
            embeds: [embed],
            components: [
                new ActionRowBuilder().setComponents(
                    new ButtonBuilder()
                        .setLabel('Delete this message')
                        .setCustomId('delete-message')
                        .setStyle(ButtonStyle.Danger)
                ) as ActionRowBuilder<ButtonBuilder>
            ]
        })
        .catch(() => {});
});
