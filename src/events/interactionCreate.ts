import { CommandInteraction, CommandInteractionOptionResolver } from "discord.js";
import { LofiEvent } from "../structures/Event";

export default new LofiEvent('interactionCreate', (interaction) => {
    if (interaction.isCommand()) {
        const cmd = interaction.client.commands.find(x => x.name === interaction.commandName);
        if (interaction.client.CooldownManager.hasCooldown({
            cmd: cmd.name,
            id: interaction.user.id
        })) return interaction.reply(`:x: | You have a cooldown on this command.\nPlease try again in ${Math.floor((interaction.client.CooldownManager.remainingCooldownTime({ cmd: cmd.name, id: interaction.user.id }) as number / 1000))} seconds`).catch(() => {});

        interaction.client.CooldownManager.setCooldown({
            time: cmd.cooldown,
            cmd: cmd.name,
            id: interaction.user.id
        });
        if (cmd.dm === false && !interaction.guild) return interaction.reply(`:x: | This command is only executable in a server`).catch(() => {});
        if (cmd.admin === true && interaction.guild && !(interaction as CommandInteraction<'cached'>).member.permissions.has('Administrator')) return interaction.reply(`:x: | This command is an admin-only command`).catch(() => {});

        const run = new Promise((resolve) => resolve(cmd.execute({
            interaction, options: interaction.options as CommandInteractionOptionResolver
        })));
        run.catch((error) => {
            console.error(error);
            interaction[(interaction.deferred || interaction.replied) ? 'editReply' : 'reply']({
                components: [],
                embeds: [],
                content: `:x: | An error occurend while running the command`
            }).catch(() => {});
        });
    }
})