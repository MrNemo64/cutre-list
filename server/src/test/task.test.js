import chai from "chai";
import chaiHttp from "chai-http";
import { app, sequelize } from "../main/app.js";
import { describe, it } from "mocha";
import { createUserAndGetToken } from "./util.js";
import { Tray } from "../main/common/models/Tray.js";
import { User } from "../main/common/models/User.js";
chai.should();

chai.use(chaiHttp);

let headers = {};
/**
 * @type {User}
 */
let user;
/**
 * @type {Tray}
 */
let tray;
let taskId;
let subtaskId;

describe("Task", () => {
    before("Empty database, obtain auth token and create tray", async () => {
        await sequelize.sync({ force: true });
        const [u, token] = await createUserAndGetToken();
        headers.Authorization = `Bearer ${token.generateJWT()}`;
        tray = await Tray.create({
            name: "Bandeja de pruebas",
            description: "",
            creatorId: u.id,
        });
        user = u;
    });
    after("Empty database", async () => {
        await sequelize.sync({ force: true });
    });

    it("Should create a default task", (done) => {
        chai.request(app)
            .post(`/cutreapi/v1/users/${user.id}/tasks`)
            .set(headers)
            .send({ title: "Tarea 1" })
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.have.property("id");
                res.body.should.have.property("title").equal("Tarea 1");
                res.body.should.have.property("description").equal("");
                res.body.should.have.property("state").equal("in_progress");
                res.body.should.have.property("priority").equal("none");
                res.body.should.have.property("creatorId").equal(user.id);
                res.body.should.not.have.property("parentTaskId");
                res.body.should.not.have.property("trayId");
                res.body.should.not.have.property("completionDate");
                taskId = res.body.id;
                done();
            });
    });

    it("Should create a subtask", (done) => {
        chai.request(app)
            .post(`/cutreapi/v1/users/${user.id}/tasks`)
            .set(headers)
            .send({
                title: "SubTarea 1",
                description: "hay que acabar la practica",
                priority: "high",
                parentTaskId: taskId,
            })
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.have.property("id");
                res.body.should.have.property("title").equal("SubTarea 1");
                res.body.should.have
                    .property("description")
                    .equal("hay que acabar la practica");
                res.body.should.have.property("state").equal("in_progress");
                res.body.should.have.property("priority").equal("high");
                res.body.should.have.property("creatorId").equal(user.id);
                res.body.should.have.property("parentTaskId").equal(taskId);
                res.body.should.not.have.property("trayId");
                res.body.should.not.have.property("completionDate");
                done();
            });
    });

    it("Should create another subtask but inside the tray", (done) => {
        chai.request(app)
            .post(`/cutreapi/v1/users/${user.id}/tasks`)
            .set(headers)
            .send({
                title: "SubTarea 1",
                description: "hay que acabar la practica",
                priority: "high",
                parentTaskId: taskId,
                trayId: tray.id,
            })
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.have.property("id");
                res.body.should.have.property("title").equal("SubTarea 1");
                res.body.should.have
                    .property("description")
                    .equal("hay que acabar la practica");
                res.body.should.have.property("state").equal("in_progress");
                res.body.should.have.property("priority").equal("high");
                res.body.should.have.property("creatorId").equal(user.id);
                res.body.should.have.property("parentTaskId").equal(taskId);
                res.body.should.have.property("trayId").equal(tray.id);
                res.body.should.not.have.property("completionDate");
                subtaskId = res.body.id;
                done();
            });
    });

    it("Should edit the parent task and add it to the tray and mark as completed", (done) => {
        chai.request(app)
            .put(`/cutreapi/v1/users/${user.id}/tasks/${taskId}`)
            .set(headers)
            .send({
                description: "tarea padre",
                state: "done",
                trayId: tray.id,
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property("id");
                res.body.should.have.property("title").equal("Tarea 1");
                res.body.should.have
                    .property("description")
                    .equal("tarea padre");
                res.body.should.have.property("state").equal("done");
                res.body.should.have.property("priority").equal("none");
                res.body.should.have.property("creatorId").equal(user.id);
                res.body.should.not.have.property("parentTaskId");
                res.body.should.have.property("trayId").equal(tray.id);
                res.body.should.have.property("completionDate");
                done();
            });
    });

    it("Does not allow to set a task parent task to itself", (done) => {
        chai.request(app)
            .put(`/cutreapi/v1/users/${user.id}/tasks/${taskId}`)
            .set(headers)
            .send({ parentTaskId: taskId })
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
    });

    it("Should have 3 tasks", (done) => {
        chai.request(app)
            .get(`/cutreapi/v1/users/${user.id}/tasks`)
            .set(headers)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property("metadata").be.an("object");
                res.body.metadata.should.have.property("page").equal(0);
                res.body.metadata.should.have.property("returned").equal(3);
                res.body.metadata.should.have.property("total").equal(3);
                res.body.should.have.property("values").be.an("array");
                res.body.values.should.have.length(3);
                done();
            });
    });

    it("The parent task shows with its subtasks", (done) => {
        chai.request(app)
            .get(`/cutreapi/v1/users/${user.id}/tasks/${taskId}`)
            .set(headers)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property("id").equal(taskId);
                res.body.should.have.property("title").equal("Tarea 1");
                res.body.should.have
                    .property("description")
                    .equal("tarea padre");
                res.body.should.have.property("state").equal("done");
                res.body.should.have.property("priority").equal("none");
                res.body.should.have.property("creatorId").equal(user.id);
                res.body.should.not.have.property("parentTaskId");
                res.body.should.have.property("trayId").equal(tray.id);
                res.body.should.have.property("completionDate");
                res.body.should.have.property("subtasks").be.an("array");
                res.body.subtasks[0].should.have
                    .property("parentTaskId")
                    .equal(taskId);
                res.body.subtasks[1].should.have
                    .property("parentTaskId")
                    .equal(taskId);
                done();
            });
    });

    it("Should filter by state='done'", (done) => {
        chai.request(app)
            .get(
                `/cutreapi/v1/users/${user.id}/tasks?${new URLSearchParams({
                    state: "done",
                }).toString()}`
            )
            .set(headers)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property("metadata").be.an("object");
                res.body.metadata.should.have.property("page").equal(0);
                res.body.metadata.should.have.property("returned").equal(1);
                res.body.metadata.should.have.property("total").equal(1);
                res.body.should.have.property("values").be.an("array");
                res.body.values.should.have.length(1);
                res.body.values[0].should.have.property("id").equal(taskId);
                done();
            });
    });

    it("Should delete a subtask", (done) => {
        chai.request(app)
            .delete(`/cutreapi/v1/users/${user.id}/tasks/${subtaskId}`)
            .set(headers)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    it("Should have 2 tasks", (done) => {
        chai.request(app)
            .get(`/cutreapi/v1/users/${user.id}/tasks`)
            .set(headers)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property("metadata").be.an("object");
                res.body.metadata.should.have.property("page").equal(0);
                res.body.metadata.should.have.property("returned").equal(2);
                res.body.metadata.should.have.property("total").equal(2);
                res.body.should.have.property("values").be.an("array");
                res.body.values.should.have.length(2);
                done();
            });
    });

    it("Should delete a task and its subtask", (done) => {
        chai.request(app)
            .delete(`/cutreapi/v1/users/${user.id}/tasks/${taskId}?deleteSubtasks=true`)
            .set(headers)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    it("Should have 0 tasks", (done) => {
        chai.request(app)
            .get(`/cutreapi/v1/users/${user.id}/tasks`)
            .set(headers)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property("metadata").be.an("object");
                res.body.metadata.should.have.property("page").equal(0);
                res.body.metadata.should.have.property("returned").equal(0);
                res.body.metadata.should.have.property("total").equal(0);
                res.body.should.have.property("values").be.an("array");
                res.body.values.should.have.length(0);
                done();
            });
    });
});
