import { Router } from "express";

import { verify } from "../common/middlewares/SchemaValidationMiddleware.js";
import { REGISTER as REGISTER_SCHEMA, LOGIN as LOGIN_SCHEMA } from "./schemas.js";

import { register, login } from "./controllers/AuthenticationController.js";

export const router = Router();

router.post(
    "/register",
    [verify(REGISTER_SCHEMA)],
    register
);

router.post(
    "/login",
    [verify(LOGIN_SCHEMA)],
    login
);