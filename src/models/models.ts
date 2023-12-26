import sequelize from '../db'
import {DataTypes, Model, ModelDefined, Optional} from 'sequelize'
import {
    GameAttributes,
    GameCreationAttributes,
    QueueAttributes,
    QueueCreationAttributes,
    UserAttributes,
    UserCreationAttributes
} from "./types";

export const User: ModelDefined<UserAttributes, UserCreationAttributes> = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    user_id: {type: DataTypes.BIGINT, unique: true},
    username: {type: DataTypes.STRING(50), unique: true},
    name: {type: DataTypes.STRING},
    language: {type: DataTypes.STRING(2)},
    referral: {type: DataTypes.STRING},
    gender: {type: DataTypes.STRING},
    active: {type: DataTypes.BOOLEAN, defaultValue: true},
    age: {type: DataTypes.INTEGER},
    socket_id: {type: DataTypes.STRING, unique: true},
}, {
    scopes: {
        active: {
            where: {active: true}
        },
    }
})

export const Game: ModelDefined<GameAttributes, GameCreationAttributes>  = sequelize.define('game', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    white_player_id: {type: DataTypes.BIGINT},
    black_player_id: {type: DataTypes.BIGINT},
    winner_id: {type: DataTypes.BIGINT},
    last_fen: {type: DataTypes.STRING},

}, {
    freezeTableName: true,
    timestamps: false,
})

Game.belongsTo(User, {foreignKey: 'white_player_id', as: 'whitePlayer'})
Game.belongsTo(User, {foreignKey: 'black_player_id', as: 'blackPlayer'})
Game.belongsTo(User, {foreignKey: 'winner_id', as: 'winner'})

export const Queue: ModelDefined<QueueAttributes, QueueCreationAttributes>  = sequelize.define('queue', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    user_id: {type: DataTypes.BIGINT},
}, {
    freezeTableName: true,
    timestamps: false,
})

Queue.belongsTo(User, {foreignKey: 'user_id', as: 'user'})
