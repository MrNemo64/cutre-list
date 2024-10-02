import sequelize, { Op } from "sequelize";
import { unlink } from "fs/promises";

import { Task, TaskPriority, TaskState } from "../../common/models/Task.js";
import { Tray } from "../../common/models/Tray.js";
import { resolveFile } from "../../util/file.js";
import { sendEventToUser } from "../../common/services/EventService.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function createTask(req, res) {
    try {
        const data = req.body;
        if (!data.description) data.description = "";
        data.creatorId = +req.params.userId;
        const task = (await Task.create(data)).toJSONSanitized();
        sendEventToUser(req.authUser.id, {
            name: "TaskCreatedEvent",
            data: task,
        })
        res.status(201).json(task);
    } catch (e) {
        return res.status(500).json({
            error: "Can not create task.",
            message: e,
        });
    }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function getAllTasksFromUser(req, res) {
    const filters = getFilters(req.query);
    const baseurl = `/cutreapi/v1/users/${req.params.userId}/tasks`;

    await paginate(
        { creatorId: req.params.userId },
        req.query,
        filters,
        baseurl
    )
        .then((obj) => res.status(200).json(obj))
        .catch((err) =>
            res.status(500).json({
                error: `Error getting tasks from user ${req.params.userId}.`,
                message: err,
            })
        );
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function getAllTasksFromTray(req, res) {
    const filters = getFilters(req.query);
    const baseurl = `/cutreapi/v1/users/${req.params.userId}/trays/${req.params.trayId}/tasks`;

    await paginate({ trayId: req.params.trayId }, req.query, filters, baseurl)
        .then((obj) => res.status(200).json(obj))
        .catch((err) =>
            res.status(500).json({
                error: `Error getting tasks from tray ${req.params.trayId}.`,
                message: err,
            })
        );
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function getTaskById(req, res) {
    await Task.findAll({
        where: {
            parentTaskId: req.paramTask.id,
        },
    })
        .then((subtasks) => subtasks.map((t) => t.toJSONSanitized()))
        .then((subtasks) => {
            res.status(200).json({
                ...req.paramTask.toJSONSanitized(),
                subtasks,
            });
        })
        .catch((err) =>
            res.status(500).json({
                error: `Error getting task ${req.paramTask.id}.`,
                message: err,
            })
        );
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function modifyTask(req, res) {
    /**
     * @type {Task}
     */
    const task = req.paramTask;
    const { body } = req;
    if (Object.keys(req.body).length == 0)
        return res.status(400).json({
            error: "Bad request",
            message: "No values in body",
        });

    if (body.parentTaskId) {
        if (body.parentTaskId == task.id) {
            return res.status(400).json({
                error: "Invalid parent task",
                message: "A task cannot be its own parent",
            });
        }
        const parentTask = await Task.findByPk(body.parentTaskId);
        if (!parentTask) {
            return res.status(404).json({
                error: "Invalid parent task",
                message: "The asigned parent task does not exist",
            });
        }
        if (parentTask.creatorId != req.authUser.id) {
            return res.status(403).json({
                error: "Invalid parent task",
                message: "You must own the asigned parent task",
            });
        }
    }

    if (body.trayId) {
        const tray = await Tray.findByPk(body.trayId);
        if (!tray) {
            return res.status(404).json({
                error: "Invalid tray",
                message: "The asigned tray does not exist",
            });
        }
        if (tray.creatorId != req.authUser.id) {
            return res.status(403).json({
                error: "Invalid tray",
                message: "You must own the asigned tray",
            });
        }
    }

    if (req.body.state == "done") {
        req.body.completionDate = new Date(Date.now());
    } else if(req.body.state == "in_progress" || req.body.state == "wont_do") {
        req.body.completionDate = null;
    }

    task.set(req.body);
    await task
        .save()
        .then((task) => {
            const jsonTask = task.toJSONSanitized();
            sendEventToUser(req.authUser.id, {
                name: "TaskEdittedEvent",
                data: jsonTask,
            });
            res.status(200).json(jsonTask);
        })
        .catch((err) =>
            res.status(500).json({
                error: "Error saving task.",
                message: err,
            })
        );
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function deleteTask(req, res) {
    /**
     * @type {Promise<number>}
     */
    let deletePromise;
    if (req.query.deleteSubtasks == "true") {
        deletePromise = Task.destroy({
            where: {
                [sequelize.Op.or]: {
                    id: req.paramTask.id,
                    parentTaskId: req.paramTask.id,
                },
            },
        });
    } else {
        deletePromise = Task.destroy({
            where: {
                id: req.paramTask.id,
            },
        });
    }
    await deletePromise
        .then((deleted) => {
            sendEventToUser(req.authUser.id, {
                name: "TasksDeletedEvent",
                data: {
                    id: req.paramTask.id,
                    deletedSubtasks: req.query.deleteSubtasks == "true",
                }
            })
            res.status(200).json({ deleted });
        }).catch((err) =>
            res.status(500).json({
                error: "Error creating task.",
                message: err,
            })
        );
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function setAttachment(req, res) {
    /**
     * @type {Task}
     */
    const task = req.paramTask;
    const oldAttachment = task.attachment;
    task.set({
        attachment: req.file.filename,
    });
    await task
        .save()
        .then((task) => {
            const jsonTask = task.toJSONSanitized();
            sendEventToUser(req.authUser.id, {
                name: "TaskEdittedEvent",
                data: jsonTask,
            });
            res.status(201).json(jsonTask);
        })
        .catch((err) =>
            res.status(500).json({
                error: "Error saving attachment.",
                message: err,
            })
        );
    if (oldAttachment) {
        try {
            await unlink(
                resolveFile(process.env.ATTACHMENTS_DIRECTORY, oldAttachment)
            );
            console.info("Deleted old attachment:", oldAttachment);
        } catch (e) {
            console.error("Error deleting old attachment:", e);
        }
    }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function getAttachment(req, res) {
    /**
     * @type {Task}
     */
    const task = req.paramTask;
    if (!task.attachment) {
        return res.status(404).json({
            error: "No attachment",
            message: `The task ${task.id} does not have an attachment`,
        });
    }
    res.sendFile(
        resolveFile(process.env.ATTACHMENTS_DIRECTORY, task.attachment)
    );
}

/**
 * @typedef {Object} TaskFilter
 * @property {string} [title] - A non-empty string representing the title of the task.
 * @property {string} [description] - A non-empty string representing the description of the task.
 * @property {("in_progress"|"done"|"wont_do")} [state] - The state of the task, which can be one of "in_progress," "done," or "wont_do".
 * @property {("none"|"low"|"medium"|"high")} [priority] - The priority of the task, which can be one of "none," "low," "medium," or "high".
 * @property {Date} [startDate] - The start date of the task.
 * @property {Date} [deadLine] - The deadline date of the task.
 * @property {Date} [completionDate] - The completion date of the task.
 * @property {number[]} [tray] - The tray of the task.
 */

/**
 * @param {TaskFilter} filters
 */
function createWhereFromFilters(filters) {
    /**
     * @param {Date} date
     * @param {string} dateColumn
     */
    function createWhereDayFilter(date, dateColumn) {
        const day = date.getDate();
        const month = date.getMonth() + 1; // Months are 0-based in JavaScript
        const year = date.getFullYear();

        const notNullCondition = {
            [sequelize.Op.not]: null,
        };
        const dateCondition = sequelize.where(
            sequelize.fn("strftime", "%d/%m/%Y", sequelize.col(dateColumn)),
            "=",
            `${day}/${month}/${year}`
        );

        return {
            [sequelize.Op.and]: [notNullCondition, dateCondition],
        };
    }

    let where = {};
    if (filters.title) {
        where = {
            ...where,
            title: {
                [sequelize.Op.substring]: filters.title,
            },
        };
    }
    if (filters.description) {
        where = {
            ...where,
            description: {
                [sequelize.Op.substring]: filters.description,
            },
        };
    }
    if (filters.state) {
        where = {
            ...where,
            state: filters.state,
        };
    }
    if (filters.priority) {
        where = {
            ...where,
            priority: filters.priority,
        };
    }
    if (filters.startDate) {
        where = {
            ...where,
            startDate: createWhereDayFilter(filters.startDate, "startDate"),
        };
    }
    if (filters.deadLine) {
        where = {
            ...where,
            deadLine: createWhereDayFilter(filters.deadLine, "deadLine"),
        };
    }
    if (filters.completionDate) {
        where = {
            ...where,
            completionDate: createWhereDayFilter(
                filters.completionDate,
                "completionDate"
            ),
        };
    }
    if(filters.tray) {
        where = {
            ...where,
            trayId: {
                [Op.in]: filters.tray,
            },
        }
    }
    return where;
}

/**
 * @param {TaskFilter} filters
 * @param {number} page
 * @param {number} limit
 * @param {number} total
 */
function createQueryFromFilters(filters, page, limit) {
    /**
     * @param {Date} date
     * @returns {string}
     */
    function formatDate(date) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay()}`;
    }
    if (page < 0) return "";
    if (filters.startDate) filters.startDate = formatDate(filters.startDate);
    if (filters.deadLine) filters.deadLine = formatDate(filters.deadLine);
    if (filters.completionDate)
        filters.completionDate = formatDate(filters.completionDate);
    const obj = {
        ...filters,
        limit,
        page,
        tray: undefined,
    };
    Object.keys(obj).forEach((key) => {
        if (obj[key] === undefined) delete obj[key];
    });
    const url = new URLSearchParams(obj);
    filters.tray?.forEach(v => url.append("tray", v));
    return url.toString();
}

/**
 * @param {QueryString.ParsedQs} parametes
 * @returns {TaskFilter}
 */
function getFilters(parametes) {
    let {
        title,
        description,
        state,
        priority,
        startDate,
        deadLine,
        completionDate,
        tray
    } = parametes;
    if (state && !TaskState.values().includes(state)) state = undefined;
    if (priority && !TaskPriority.values().includes(priority))
        priority = undefined;
    if (startDate) startDate = new Date(startDate);
    if (deadLine) deadLine = new Date(deadLine);
    if (completionDate) completionDate = new Date(completionDate);
    if(tray) tray = Array.isArray(tray) ? tray : [ tray ];
    return {
        title,
        description,
        state,
        priority,
        startDate,
        deadLine,
        completionDate,
        tray
    };
}

/**
 * @param {QueryString.ParsedQs} querry
 * @param {TaskFilter} filters
 * @param {string} baseurl
 * @returns {Promise<object>}
 */
async function paginate(basewhere, querry, filters, baseurl) {
    const where = {
        ...basewhere,
        ...createWhereFromFilters(filters),
    };
    const page = +querry.page || 0;
    const limit = Math.min(100, +querry.limit || 10);
    const total = await Task.count({ where });

    const tasks = await Task.findAll({
        limit,
        offset: limit * page,
        where,
    });

    const nextQueryParams = createQueryFromFilters(filters, page + 1, limit);
    const prevQueryParams = createQueryFromFilters(filters, page - 1, limit);
    if (nextQueryParams) var nextUrl = baseurl + "?" + nextQueryParams + "&reduced=" + querry.reduced == true;
    if (prevQueryParams) var prevUrl = baseurl + "?" + prevQueryParams + "&reduced=" + querry.reduced == true;

    return {
        metadata: {
            page,
            returned: tasks.length,
            total,
            next: nextUrl,
            prev: prevUrl,
        },
        values: tasks.map((t) => t.toJSONSanitized(querry.reduced == true)),
    };
}
