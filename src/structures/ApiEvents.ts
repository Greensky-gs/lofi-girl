import { changeType } from "lofi-girl-api-wrapper";
import { ApiEvent } from "./APIEvent";
import { readdirSync } from 'node:fs'

export class ApiEvents {
    private list: Map<changeType, ApiEvent<changeType>> = new Map()

    constructor() {
        this.start()
    }

    public getEvent<K extends changeType>(key: K): ApiEvent<K> | null {
        return this.list.get(key) as unknown as ApiEvent<K>
    }
    private start() {
        readdirSync('./dist/apiEvents').forEach((fileName) => {
            const file = require(`../apiEvents/${fileName}`);
            const value = (file?.default ?? file) as ApiEvent<changeType>;

            this.list.set(value.type, value);
        })
    }
}