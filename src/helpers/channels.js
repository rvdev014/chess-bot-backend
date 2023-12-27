import {Channel} from "../models/models.ts";

export async function getChannelsList() {
    return await Channel.findAll({raw: true})
}