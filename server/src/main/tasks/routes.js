import { Router } from "express";

import { check as checkAuth } from "../common/middlewares/IsAuthenticatedMiddleware.js";
import { canAuthUserSeeUser } from "../common/middlewares/AuthUserCanSeeUserMiddleware.js";
import { verify } from "../common/middlewares/SchemaValidationMiddleware.js";
import { userInParamExists } from "../common/middlewares/UserInParamExistsMiddleware.js";
import { trayInParamExists } from "../trays/middlewares/TrayInParamExistsMiddleware.js";
import { trayInParamExistsInUserInParam } from "../trays/middlewares/TrayInParamExistsInUserInParam.js";
import { taskInParamExists } from "./middlewares/TaskInParamExistsMiddleware.js";
import { taskInParamExistsInUser } from "./middlewares/TaskInParamExistsInUserMiddleware.js";
import { createStorage } from "../common/middlewares/UploadFileMiddleware.js";

import { createTask, deleteTask, getAllTasksFromTray, getAllTasksFromUser, getAttachment, getTaskById, modifyTask, setAttachment } from "./controllers/TaskController.js";

import { CREATE_TASK as CREATE_TASK_SCHEMA, UPDATE_TASK as UPDATE_TASK_SCHEMA  } from "./schemas.js";

export const router = Router();

router.post(
    "/:userId/tasks",
    [
        verify(CREATE_TASK_SCHEMA),
        checkAuth,
        canAuthUserSeeUser,
        userInParamExists,
    ],
    createTask,
);

router.get(
    "/:userId/tasks",
    [
        checkAuth,
        canAuthUserSeeUser,
        userInParamExists,
    ],
    getAllTasksFromUser,
);

router.get(
    "/:userId/trays/:trayId/tasks",
    [
        checkAuth,
        canAuthUserSeeUser,
        userInParamExists,
        trayInParamExists,
        trayInParamExistsInUserInParam,
    ],
    getAllTasksFromTray,
);

router.get(
    "/:userId/tasks/:taskId",
    [
        checkAuth,
        canAuthUserSeeUser,
        userInParamExists,
        taskInParamExists,
        taskInParamExistsInUser,
    ],
    getTaskById,
);

router.put(
    "/:userId/tasks/:taskId",
    [
        verify(UPDATE_TASK_SCHEMA),
        checkAuth,
        canAuthUserSeeUser,
        userInParamExists,
        taskInParamExists,
        taskInParamExistsInUser,
    ],
    modifyTask,
);

router.delete(
    "/:userId/tasks/:taskId",
    [
        checkAuth,
        canAuthUserSeeUser,
        userInParamExists,
        taskInParamExists,
        taskInParamExistsInUser,
    ],
    deleteTask,
);

router.post(
    "/:userId/tasks/:taskId/attachment",
    [
        checkAuth,
        canAuthUserSeeUser,
        userInParamExists,
        taskInParamExists,
        taskInParamExistsInUser,
        createStorage({
            folderChooser: () => "attachments/",
            fileNamer: (_, file) => `${Date.now()}-${file.originalname}`,
        }).single("attachment"),
    ],
    setAttachment,
);

router.get(
    "/:userId/tasks/:taskId/attachment",
    [
        userInParamExists,
        taskInParamExists,
        taskInParamExistsInUser,
    ],
    getAttachment,
);