import { CommandInteraction, CommandInteractionOptionResolver } from 'discord.js';
import { LofiEvent } from '../structures/Event';
import { stations } from '../utils/configs.json';
import { station } from '../typings/station';

export default new LofiEvent('interactionCreate', (interaction) => {
    if (interaction.isCommand()) {
        const cmd = interaction.client.commands.find((x) => x.name === interaction.commandName);
        if (
            interaction.client.CooldownManager.hasCooldown({
                cmd: cmd.name,
                id: interaction.user.id
            })
        )
            return interaction
                .reply(
                    `:x: | You have a cooldown on this command.\nPlease try again in ${Math.floor(
                        (interaction.client.CooldownManager.remainingCooldownTime({
                            cmd: cmd.name,
                            id: interaction.user.id
                        }) as number) / 1000
                    )} seconds`
                )
                .catch(() => {});

        interaction.client.CooldownManager.setCooldown({
            time: cmd.cooldown,
            cmd: cmd.name,
            id: interaction.user.id
        });
        if (cmd.dm === false && !interaction.guild)
            return interaction.reply(`:x: | This command is only executable in a server`).catch(() => {});
        if (
            cmd.admin === true &&
            interaction.guild &&
            !(interaction as CommandInteraction<'cached'>).member.permissions.has('Administrator')
        )
            return interaction.reply(`:x: | This command is an admin-only command`).catch(() => {});

        const run = new Promise((resolve) =>
            resolve(
                cmd.execute({
                    interaction,
                    options: interaction.options as CommandInteractionOptionResolver
                })
            )
        );
        run.catch((error) => {
            console.error(error);
            interaction[interaction.deferred || interaction.replied ? 'editReply' : 'reply']({
                components: [],
                embeds: [],
                content: `:x: | An error occured while running the command`
            }).catch(() => {});
        });
    }
    if (interaction.isAutocomplete()) {
        const focused = interaction.options.getFocused(true);

        if (focused.name === 'command') {
            return interaction
                .respond(
                    interaction.client.commands
                        .filter((c) => c.name.includes(focused.value) || focused.value.includes(c.name))
                        .map((x) => ({ name: x.name, value: x.name }))
                )
                .catch(() => {});
        }
        if (focused.name === 'station') {
            const RawResponse = ((stations as station[]).concat({ name: 'random', url: 'random', emoji: '🎲', type: 'get a random station' })).filter(
                (s) =>
                    s.name.toLowerCase().includes(focused.value.toLowerCase()) ||
                    focused.value.toLowerCase().includes(s.name.toLowerCase()) ||
                    s.type.includes(focused.value.toLowerCase()) ||
                    focused.value.toLowerCase().includes(s.type)
            );

            let response: station[] = [];
            if (RawResponse.length > 25) {
                // Here we are going to randomise the response to display differents musics everytime
                for (let i = 0; i < 25; i++) {
                    const arr = RawResponse.filter((x) => !response.map((y) => y.url).includes(x.url));
                    const selected = arr[Math.floor(Math.random() * arr.length)];

                    response.push(selected);
                }
            } else {
                response = RawResponse;
            }

            return interaction
                .respond(response.map((x) => ({ name: `${x.emoji} ${x.name} - ${x.type}`, value: x.url })))
                .catch(() => {});
        }
    }
});
