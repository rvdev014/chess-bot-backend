export interface IClient {
    userId?: string;
    socketId: string;
}

export interface IGame {
    roomId: string;
    white: IClient;
    black: IClient;
    lastFen: string | null;
}

export type TGame = { [key: string]: IGame }
export type TQueue = { [key: string]: IClient }