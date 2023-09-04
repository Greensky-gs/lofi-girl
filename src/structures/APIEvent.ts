import { changeType, change } from "lofi-girl-api-wrapper";
import { apiCallback } from "../typings/bot";

export class ApiEvent<T extends changeType> {
    private _type: T;
    private _callback: apiCallback<T>
    
    constructor(type: T, callback: apiCallback<T>) {
        this._type = type;
        this._callback = callback
    }

    public get type() {
        return this._type;
    }
    public call(change: change<T>) {
        this._callback(change);
    }   
}