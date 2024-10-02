/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {Function} next
 */
export async function taskInParamExistsInUser(req, res, next) {
    if (req.paramTask.creatorId != req.params.userId) {
        return res.status(400).json({
            error: "No task.",
            message: `Task ${req.params.taskId} does not belong to user ${req.params.userId}`,
        });
    }
    next();
}
