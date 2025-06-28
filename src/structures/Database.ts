import { initializeApp, FirebaseApp } from 'firebase/app'
import { getDatabase, Database as FirebaseDatabase, onValue, ref } from 'firebase/database'
import { getStorage, FirebaseStorage, ref as storageRef } from 'firebase/storage'
import { databaseCallback } from '../typings/station';
import { stationType } from '../typings/firebase';

export class Database {
    private app: FirebaseApp;
    private db: FirebaseDatabase;
    private storage: FirebaseStorage;
    private launchCallback: databaseCallback;
    private _stations: Record<string, stationType<false>> = {};
    private readyCount = 0;
    private _ready = false

    constructor() {
        this.start()
    }

    public get ready() {
        return this._ready;
    }
    public get stations() {
        return this._stations;
    }

    public onLaunch(callback: databaseCallback) {
        this.launchCallback = callback;
    };
    public audioRef(id: string) {
        return storageRef(this.storage, `${id}.mp3`)
    }

    private pushStation(station: stationType<true>) {
        const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/
        const emoji = station.title.match(emojiRegex)?.[0] ?? null;
        
        this._stations[station.id] = {
            ...station,
            authors: JSON.parse(station.authors).filter((x: string) => x !== 'x'),
            tracks: JSON.parse(station.tracks),
            emoji,
            title: station.title.replace(emojiRegex, '').trim()
        }
    }
    private async createStations() {
        onValue(ref(this.db, 'stations'), async(snap) => {
            const values = snap.val() as Record<string, stationType<true>>;

            Object.values(values).forEach(this.pushStation.bind(this));

            setTimeout(() => {
                this.readyCount++;
                this.checkReady();
            }, 1000)
        })
    }
    private checkReady() {
        if (this.readyCount === 1) {
            this._ready = true;

            if (!!this.launchCallback) {
                this.launchCallback(this);
            }
        }
    }

    private start() {
        this.app = initializeApp({
            databaseURL: process.env.dbUrl,
            storageBucket: process.env.bucketUrl
        })

        this.db = getDatabase(this.app)
        this.storage = getStorage(this.app)

        this.createStations()
    }
}