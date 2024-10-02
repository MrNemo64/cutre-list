import { Tray } from "../../common/models/Tray.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {Function} next
 */
export async function trayInParamExists(req, res, next) {
    const paramTray = await Tray.findByPk(req.params.trayId);
    if(paramTray) {
        req.paramTray = paramTray;
        return next();
    }
    return res.status(400)
        .json({
            error: "No tray.",
            message: `No tray with the id ${req.params.trayId}`,
        });
}