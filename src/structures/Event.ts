import { ClientEvents } from "discord.js";

export class LofiEvent<K extends keyof ClientEvents> {
    constructor(
        public event: K,
        public run: (...args: ClientEvents[K]) => any
    ) {

    }
}