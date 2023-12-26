import {Optional} from "sequelize";

export type UserAttributes = {
    id: number;
    user_id: number;
    username: string;
    name: string;
    language: string;
    referral: string | null;
    gender: string | null;
    active: boolean;
    age: number;
    socket_id: string | null;
};

// we're telling the Model that 'id' is optional
// when creating an instance of the model (such as using Model.create()).
export type UserCreationAttributes = Optional<UserAttributes, 'id'>;

export type GameAttributes = {
    id: number;
    white_player_id: number;
    black_player_id: number;
    winner_id: number;
    last_fen: string;
    whitePlayer?: UserAttributes;
    blackPlayer?: UserAttributes;
    winner?: UserAttributes;
};

// we're telling the Model that 'id' is optional
// when creating an instance of the model (such as using Model.create()).
export type GameCreationAttributes = Optional<GameAttributes, 'id'>;

export type QueueAttributes = {
    id: number;
    user_id: number;
    user?: UserAttributes;
};

// we're telling the Model that 'id' is optional
// when creating an instance of the model (such as using Model.create()).
export type QueueCreationAttributes = Optional<QueueAttributes, 'id'>;