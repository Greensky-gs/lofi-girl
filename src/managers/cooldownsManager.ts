import { Collection } from 'discord.js';

type cdOptions = {
    id: string;
    cmd: string;
};

export class CooldownManager {
    private cooldowns: Collection<string, number>;
    
    constructor() {
        this.cooldowns = new Collection();
    }
    public hasCooldown(opts: cdOptions): boolean {
        return this.cooldowns.has(this.code(opts));
    }
    public setCooldown({ time, ...opts }: cdOptions & { time: number }): boolean {
        if (this.hasCooldown(opts)) return false;

        this.cooldowns.set(this.code(opts), time * 1000 + Date.now());
        setTimeout(() => {
            this.cooldowns.delete(this.code(opts));
        }, time * 1000);

        return true;
    }
    public remainingCooldownTime(opts: cdOptions): false | number {
        if (!this.hasCooldown(opts)) return false;

        const time = this.cooldowns.get(this.code(opts)) as number;
        return time - Date.now();
    }
    private code({ id, cmd }: cdOptions) {
        return id + '.' + cmd;
    }
    
}