import { Router } from "express";
import { check as checkAuth } from "../common/middlewares/IsAuthenticatedMiddleware.js";

import { requestEvents, startEventStreamRequest } from "./controllers/EventsController.js";

export const router = Router();

router.post(
    "/my-events",
    [
        checkAuth,
    ],
    requestEvents,
);

router.get(
    "/my-events/:id",
    [],
    startEventStreamRequest,
);