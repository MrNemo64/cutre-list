import "dotenv/config";

import express from "express";
import morgan from "morgan";
import cors from "cors";

import { router as authRouter } from "./authentication/routes.js";
import { router as userRouter } from "./users/routes.js";
import { router as trayRouter } from "./trays/routes.js";
import { router as taskRouter } from "./tasks/routes.js";
import { router as tokenRouter } from "./tokens/routes.js";
import { router as eventRouter } from "./events/routes.js";

import { setupDatabase } from "./util/database.js";
import { Sequelize } from "sequelize";

export const app = express();
app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

const router = express.Router();
router.use("/", authRouter);
router.use("/", tokenRouter);
router.use("/users", userRouter);
router.use("/users", trayRouter);
router.use("/users", taskRouter);
router.use("/", eventRouter);

app.use("/cutreapi/v1", router);

/**
 * @type {Sequelize}
 */
export const sequelize = await (
    await setupDatabase()
)
    .sync()
    .then((seq) => {
        console.log("Sequelize initialized");

        const PORT = process.env.port || 3000;
        app.listen(PORT, () => {
            console.log("Server listening on port:", PORT);
        });
        return seq;
    })
    .catch((err) => {
        console.error("Sequelize initialization threw and error:", err);
    });
