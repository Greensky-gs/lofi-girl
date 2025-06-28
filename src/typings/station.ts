import { Database } from "../structures/Database";

export type stationTracks = Record<string, string>;
export type databaseCallback = (database: Database) => unknown;