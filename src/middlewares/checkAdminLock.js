import {isAdmin} from "../helpers/admin.js";
import {from} from "../utils/consts.js";

export default async function checkAdminLock(ctx, next) {
    if (isAdmin(from(ctx).id)) {
        return next()
    }
}
