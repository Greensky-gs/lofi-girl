import {
    ChatInputApplicationCommandData,
    CommandInteraction,
    CommandInteractionOptionResolver,
    GuildMember
} from 'discord.js';

export interface cmdInteraction extends CommandInteraction {
    member: GuildMember;
}
type runFunction = (options: { interaction: cmdInteraction; options: CommandInteractionOptionResolver }) => void;
export type commandOptions = {
    cooldown: number;
    admin: boolean;
    dm: boolean;
    execute: runFunction;
} & ChatInputApplicationCommandData;
