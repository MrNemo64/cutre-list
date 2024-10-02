import { Router } from "express";

import { check as checkAuth } from "../common/middlewares/IsAuthenticatedMiddleware.js";
import { canAuthUserSeeUser } from "../common/middlewares/AuthUserCanSeeUserMiddleware.js";
import { verify } from "../common/middlewares/SchemaValidationMiddleware.js";
import { userInParamExists } from "../common/middlewares/UserInParamExistsMiddleware.js";
import { MODIFY_USER as MODIFY_USER_SCHEMA } from "./schemas.js";

import { getUserById, getUserByAuthToken, modifyUser, deleteUser } from "./controllers/UserController.js";

export const router = Router();

router.get(
    "/self",
    [
        checkAuth,
    ],
    getUserByAuthToken,
);

router.get(
    "/:userId",
    [
        checkAuth,
        canAuthUserSeeUser,
        userInParamExists,
    ],
    getUserById,
);

router.put(
    "/:userId",
    [
        verify(MODIFY_USER_SCHEMA),
        checkAuth,
        canAuthUserSeeUser,
        userInParamExists,
    ],
    modifyUser,
);

router.delete(
    "/:userId",
    [
        checkAuth,
        canAuthUserSeeUser,
        userInParamExists,
    ],
    deleteUser,
);