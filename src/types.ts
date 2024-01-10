export interface IClient {
    userId?: string;
    socketId: string | null;
    timeLeft?: number;
}

export type SideType = 'white' | 'black';
export type GameOverReasonType = 'checkmate' | 'timeout' | 'resign' | 'draw' | 'disconnect';

export interface IGame {
    roomId: string;
    currentTurn: SideType | null;
    lastFen: string | null;
    timeLimit: number | null;
    winner?: SideType | null;
    reason?: string | null;

    white: IClient;
    black: IClient;
}

export type TGame = { [key: string]: IGame }
export type TQueue = { [key: string]: IClient }

export interface ICreateRoomState {
    friendId: string;
    timeLimit: number;
}

export interface IMoveState {
    movement: any;
    lastFen: string;
    side: 'white' | 'black';
    whiteTimeLeft: number;
    blackTimeLeft: number;
}

export interface IGameStartState {
    opponent: IClient;
    mySide: SideType;
    roomId: string;
    timeLimit: number;
}

export interface IGameOverState {
    winner: SideType;
    reason: GameOverReasonType;
    whiteTimeLeft: number;
    blackTimeLeft: number;
}