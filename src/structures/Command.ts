import { commandOptions } from '../typings/command';

export class LofiCommand {
    constructor(opts: commandOptions) {
        Object.assign(this, opts);
    }
}
