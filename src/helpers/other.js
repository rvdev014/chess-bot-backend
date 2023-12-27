import fs from "fs";
import {languages} from "../utils/consts.js";

export function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

export function isInviteLink(message) {
    try {
        return message?.text?.indexOf('https://t.me') > -1 ||
            message?.entities[0]?.type === 'text_link' && message?.text?.indexOf('https://t.me') > -1;
    } catch (e) {
        console.log('isInviteLink', e.message)
        return false
    }
}

export function getMessageByLang(key, locale = 'en') {
    try {
        if (!languages.some(language => language.key === locale)) {
            locale = 'en'
        }

        const fileContent = fs.readFileSync(`src/locales/${locale}.json`, 'utf-8');
        const locales = JSON.parse(fileContent);

        return locales[key] ?? key;
    } catch (e) {
        console.log('MessageByLang', e.message)
        return false
    }
}
