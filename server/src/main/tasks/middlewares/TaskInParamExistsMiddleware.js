import { Task } from "../../common/models/Task.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {Function} next
 */
export async function taskInParamExists(req, res, next) {
    const paramTask = await Task.findByPk(req.params.taskId);
    if (paramTask) {
        req.paramTask = paramTask;
        return next();
    }
    return res.status(400).json({
        error: "No task.",
        message: `No task with the id ${req.params.trayId}`,
    });
}