export interface IClient {
    userId?: string;
    socketId: string;
    timeLeft?: number;
}

export type SideType = 'white' | 'black';
export type GameOverReasonType = 'checkmate' | 'timeout' | 'resign' | 'draw' | 'disconnect';

export interface IGame {
    roomId: string;
    white: IClient;
    black: IClient;
    currentTurn: SideType | null;
    lastFen: string | null;

    winner?: SideType | null;
    reason?: string | null;
}

export type TGame = { [key: string]: IGame }
export type TQueue = { [key: string]: IClient }

export interface IMoveState {
    movement: any;
    lastFen: string;
    side: 'white' | 'black';
    whiteTimeLeft: number;
    blackTimeLeft: number;
}

export interface IGameOverState {
    winner: SideType;
    reason: GameOverReasonType;
    whiteTimeLeft: number;
    blackTimeLeft: number;
}