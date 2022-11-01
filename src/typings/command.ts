import { ChatInputApplicationCommandData, CommandInteraction, CommandInteractionOptionResolver } from 'discord.js';

type runFunction = (options: {
    interaction: CommandInteraction,
    options: CommandInteractionOptionResolver
}) => void;
export type commandOptions = {
    cooldown: number;
    admin: boolean;
    dm: boolean;
    execute: runFunction;
} & ChatInputApplicationCommandData;