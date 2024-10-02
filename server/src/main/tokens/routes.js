import { Router } from "express";

import { check as checkAuth } from "../common/middlewares/IsAuthenticatedMiddleware.js";
import { authUserIsAdmin } from "../common/middlewares/AuthUserIsAdmin.js";

import { revoke } from "./controllers/AuthTokenController.js";

export const router = Router();

router.post(
    "/tokens/:tokenId/revoke",
    [
        checkAuth,
        authUserIsAdmin,
    ],
    revoke,
);