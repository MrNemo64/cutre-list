import { User } from "../models/User.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {Function} next
 */
export async function userInParamExists(req, res, next) {
    const paramUser = await User.findByPk(req.params.userId);
    if(paramUser) {
        req.paramUser = paramUser;
        return next();
    }
    return res.status(400)
        .json({
            error: "No user.",
            message: `No user with the id ${req.params.userId}`,
        });
}