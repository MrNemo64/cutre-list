import { Router } from "express";

import { check as checkAuth } from "../common/middlewares/IsAuthenticatedMiddleware.js";
import { canAuthUserSeeUser } from "../common/middlewares/AuthUserCanSeeUserMiddleware.js";
import { verify } from "../common/middlewares/SchemaValidationMiddleware.js";
import { userInParamExists } from "../common/middlewares/UserInParamExistsMiddleware.js";

import { trayInParamExists } from "./middlewares/TrayInParamExistsMiddleware.js";
import { trayInParamExistsInUserInParam } from "./middlewares/TrayInParamExistsInUserInParam.js";
import { createTray, getTrayById, getAllTraysFromUser, modifyTray, deleteTray } from "./controllers/TrayController.js";

import { CREATE_TRAY as CREATE_TRAY_SCHEMA, UPDATE_TRAY as UPDATE_TRAY_SCHEMA } from "./schemas.js";

export const router = Router();

router.post(
    "/:userId/trays",
    [
        verify(CREATE_TRAY_SCHEMA),
        checkAuth,
        canAuthUserSeeUser,
        userInParamExists,
    ],
    createTray,
);

router.get(
    "/:userId/trays",
    [
        checkAuth,
        canAuthUserSeeUser,
        userInParamExists,
    ],
    getAllTraysFromUser,
);

router.get(
    "/:userId/trays/:trayId",
    [
        checkAuth,
        canAuthUserSeeUser,
        userInParamExists,
        trayInParamExists,
        trayInParamExistsInUserInParam,
    ],
    getTrayById,
);

router.put(
    "/:userId/trays/:trayId",
    [
        verify(UPDATE_TRAY_SCHEMA),
        checkAuth,
        canAuthUserSeeUser,
        userInParamExists,
        trayInParamExists,
        trayInParamExistsInUserInParam,
    ],
    modifyTray,
);

router.delete(
    "/:userId/trays/:trayId",
    [
        checkAuth,
        canAuthUserSeeUser,
        userInParamExists,
        trayInParamExists,
        trayInParamExistsInUserInParam,
    ],
    deleteTray,
);