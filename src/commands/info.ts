import { AmethystCommand } from "amethystjs";
import { ApplicationCommandOptionType } from "discord.js";

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
.setChatInputRun(({ interaction, options }) => {
    
})