import sequelize from '../db'
import {DataTypes, ModelDefined} from 'sequelize'
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
    last_name: {type: DataTypes.STRING},
    language_code: {type: DataTypes.STRING(5)},
}, {
    scopes: {
        active: {
            where: {active: true}
        },
    }
})

export const Chat = sequelize.define('chat', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    chatOne: {type: DataTypes.STRING},
    chatTwo: {type: DataTypes.STRING(50), unique: true},
}, {
    timestamps: false,
})

export const Friends = sequelize.define('friend', {
    friend_id: {type: DataTypes.BIGINT},
    friend_name: {type: DataTypes.STRING},
    user_id: {type: DataTypes.BIGINT},
    user_name: {type: DataTypes.STRING},
})

export const Show = sequelize.define('show', {
    forward_id:         {type: DataTypes.BIGINT,  defaultValue: null},
    forward_message_id: {type: DataTypes.BIGINT,  defaultValue: null},
    limit:              {type: DataTypes.INTEGER, defaultValue: 0},
    active:             {type: DataTypes.BOOLEAN, defaultValue: true},
})

export const ShowUser = sequelize.define('show_user', {
    show_id: {type: DataTypes.BIGINT},
    user_id: {type: DataTypes.BIGINT},
})

export const Channel = sequelize.define('channel', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING},
    chat: {type: DataTypes.STRING(50), unique: true},
    link: {type: DataTypes.STRING},
    active: {type: DataTypes.BOOLEAN, defaultValue: true},
})

export const PaymentLog = sequelize.define('payment_log', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    user_id: {type: DataTypes.BIGINT},
    uuid: {type: DataTypes.STRING},
    entity: {type: DataTypes.STRING},
    status: {type: DataTypes.STRING},
    data: {type: DataTypes.JSON},
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
