import { AmethystCommand } from "amethystjs";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { stations } from '../utils/configs.json';
import { inviteLink } from "../utils/functions";

module.exports = new AmethystCommand({
    name: 'info',
    description: "Display's informations",
    options: [
        {
            name: 'bot',
            description: 'Display bot\'s informations',
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: 'station',
            description: "Displays a station informations",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'station',
                    autocomplete: true,
                    required: true,
                    type: ApplicationCommandOptionType.String,
                    description: "Station to display"
                }
            ]
        }
    ]
})
.setChatInputRun(async ({ interaction, options }) => {
    const cmd = options.getSubcommand();
    if (cmd === 'bot') {
        await interaction.deferReply();
        await interaction.client.guilds.fetch();

        const embed = new EmbedBuilder()
            .setTimestamp()
            .setThumbnail(interaction.client.user.displayAvatarURL({ forceStatic: true }))
            .setTitle("Bot informations")
            .setDescription(`I'm a bot that can play lofi music in your server`)
            .setFields(
                {
                    name: 'Servers',
                    value: interaction.client.guilds.cache.size.toString(),
                    inline: true
                },
                {
                    name: 'Members',
                    value: interaction.client.guilds.cache.map(x => x.memberCount).reduce((a, b) => a + b).toString(),
                    inline: true
                },
                {
                    name: "Playing in",
                    value: interaction.client.player.queues.filter(x => x.playing).size + ' servers',
                    inline: true
                },
                {
                    name: "Stations",
                    value: stations.length.toString(),
                    inline: false
                },
                {
                    name: 'Links',
                    value: `[Invite me](${inviteLink(interaction.client)})\n[Lofi Girl channel](https://youtube.com/c/LofiGirl)\n[Source code](https://github.com/Greensky-gs/lofi-girl)`,
                    inline: false
                }
            )

        interaction.editReply({ embeds: [ embed ] }).catch(() => {});
    }
})