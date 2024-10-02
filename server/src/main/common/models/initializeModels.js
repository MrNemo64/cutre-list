import { MODEL_DEFINITION as USER_DEFINITION, User } from "./User.js";
import { MODEL_DEFINITION as TRAY_DEFINITION, Tray } from "./Tray.js";
import { MODEL_DEFINITION as TASK_DEFINITION, Task } from "./Task.js";
import {
    MODEL_DEFINITION as AUTH_TOKE_DEFINITION,
    AuthToken,
} from "./AuthToken.js";

/**
 * @param {Sequelize} sequelize
 */
export async function initialize(sequelize) {
    User.init(USER_DEFINITION, {
        sequelize,
        modelName: "User",
        paranoid: true,
        hooks: {
            afterDestroy: async (instance, options) => {
                const tasks = await Task.findAll({
                    where: {
                        creatorId: instance.id,
                    },
                });
                const trays = await Tray.findAll({
                    where: {
                        creatorId: instance.id,
                    },
                });
                if (tasks.length > 0)
                    await Promise.allSettled(
                        tasks.forEach((task) => task.destroy())
                    );
                if (trays.length > 0)
                    await Promise.allSettled(
                        trays.forEach((tray) => tray.destroy())
                    );
            },
        },
    });
    Tray.init(TRAY_DEFINITION, {
        sequelize,
        modelName: "Tray",
        paranoid: true,
        hooks: {
            afterDestroy: async (instance, options) => {
                const tasks = await Task.findAll({
                    where: {
                        trayId: instance.id,
                    },
                });
                if (tasks.length > 0) {
                    await Promise.allSettled(
                        tasks.map((t) => {
                            t.set({ trayId: null });
                            return t.save();
                        })
                    );
                }
            },
        },
    });
    Task.init(TASK_DEFINITION, {
        sequelize,
        modelName: "Task",
        paranoid: true,
    });
    AuthToken.init(AUTH_TOKE_DEFINITION, {
        sequelize,
        modelName: "AuthToken",
        paranoid: true,
    });

    Tray.belongsTo(User, {
        foreignKey: "creatorId",
        as: "creator",
    });

    Task.belongsTo(User, {
        foreignKey: "creatorId",
        as: "creator",
    });

    Task.belongsTo(Tray, {
        foreignKey: "trayId",
        as: "tray",
    });

    Task.belongsTo(Task, {
        foreignKey: "parentTaskId",
        as: "parentTask",
    });

    AuthToken.belongsTo(User, {
        foreignKey: "userId",
        as: "user",
    });

    await User.sync();
    await Tray.sync();
    await Task.sync();
    await AuthToken.sync();
}
