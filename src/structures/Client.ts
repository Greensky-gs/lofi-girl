import { Player } from "discord-player";
import { Client, ClientEvents, Partials } from "discord.js";
import { config } from "dotenv";
import { readdirSync } from "fs";
import { CooldownManager } from "../managers/cooldownsManager";
import { commandOptions } from "../typings/command";
import { LofiEvent } from "./Event";
config();

export class LofiClient extends Client {
    private fileName: string = __filename.endsWith('.ts') ? 'src':'dist';
    public CooldownManager: CooldownManager = new CooldownManager();
    public commands: commandOptions[] = [];
    public player: Player;

    constructor() {
        super({
            intents: ['GuildVoiceStates', 'Guilds'],
            partials: [Partials.Channel]
        })
        this.player = new Player(this);
    }
    public get inviteLink() {
        return `https://discord.com/api/oauth2/authorize?client_id=${this.user.id}&permissions=277028554752&scope=bot%20applications.commands`
    }
    public start() {
        this.login(process.env.token);
        this.loadCommands();
        this.loadEvents();
    }
    private loadEvents() {
        readdirSync(`./${this.fileName}/events`).forEach((fileName) => {
            const file: LofiEvent<keyof ClientEvents> = require(`../events/${fileName}`).default;
            this.on(file.event, file.run);
        })
    }
    private loadCommands() {
        readdirSync(`./${this.fileName}/commands`).forEach((fileName) => {
            const file: commandOptions = require('../commands/' + fileName).default;
            this.commands.push(file);
        });
        this.registerCommands();
    }
    private registerCommands() {
        this.on('ready', () => {
            this.application.commands.set(this.commands);
        });
    }
}

declare module 'discord.js' {
    interface Client {
        commands: commandOptions[];
        CooldownManager: CooldownManager;
        inviteLink: string;
        player: Player;
    }
}