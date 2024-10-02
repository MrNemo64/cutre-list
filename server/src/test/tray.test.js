import chai from "chai";
import chaiHttp from "chai-http";
import { app, sequelize } from "../main/app.js";
import { describe, it } from "mocha";
import { createUserAndGetToken } from "./util.js";
chai.should();

chai.use(chaiHttp);

let headers = {};
let user;
let trayId;

describe("Tray", () => {
    before("Empty database and obtain auth token", async () => {
        await sequelize.sync({ force: true });
        const [u, token] = await createUserAndGetToken();
        headers.Authorization = `Bearer ${token.generateJWT()}`;
        user = u;
    });
    after("Empty database", async () => {
        await sequelize.sync({ force: true });
    });

    it("Should create a tray", done => {
        chai.request(app)
            .post(`/cutreapi/v1/users/${user.id}/trays`)
            .set(headers)
            .send({ name: "Inbox" })
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.have.property("id");
                res.body.should.have.property("name").equal("Inbox");
                res.body.should.have.property("description").equal("");
                trayId = res.body.id;
                done();
            });
    });

    it("Should have a tray", done => {
        chai.request(app)
            .get(`/cutreapi/v1/users/${user.id}/trays/${trayId}`)
            .set(headers)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property("id").equal(trayId);
                res.body.should.have.property("name").equal("Inbox");
                res.body.should.have.property("description").equal("");
                done();
            });
    });

    it("Should edit the tray", done => {
        chai.request(app)
            .put(`/cutreapi/v1/users/${user.id}/trays/${trayId}`)
            .set(headers)
            .send({ description: "Tray where new tasks end up to be sorted" })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property("id").equal(trayId);
                res.body.should.have.property("name").equal("Inbox");
                res.body.should.have.property("description").equal("Tray where new tasks end up to be sorted");
                done();
            });
    });

    it("Should create another tray", done => {
        chai.request(app)
        .post(`/cutreapi/v1/users/${user.id}/trays`)
        .set(headers)
        .send({ name: "Today", description: "Tasks to do today, ideally" })
        .end((err, res) => {
            res.should.have.status(201);
            res.body.should.have.property("id");
            res.body.should.have.property("name").equal("Today");
            res.body.should.have.property("description").equal("Tasks to do today, ideally");
            done();
        });
    });

    it("Should have 2 trays", done => {
        chai.request(app)
        .get(`/cutreapi/v1/users/${user.id}/trays`)
        .set(headers)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an("array");
            res.body.should.have.length(2);
            res.body[0].should.have.property("name").equal("Inbox");
            res.body[0].should.have.property("description").equal("Tray where new tasks end up to be sorted");
            res.body[1].should.have.property("name").equal("Today");
            res.body[1].should.have.property("description").equal("Tasks to do today, ideally");
            done();
        });
    });

    it("Should delete a tray", done => {
        chai.request(app)
        .delete(`/cutreapi/v1/users/${user.id}/trays/${trayId}`)
        .set(headers)
        .end((err, res) => {
            res.should.have.status(200);
            done();
        })
    });

    it("Should have 1 tray", done => {
        chai.request(app)
        .get(`/cutreapi/v1/users/${user.id}/trays`)
        .set(headers)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an("array");
            res.body.should.have.length(1);
            res.body[0].should.have.property("name").equal("Today");
            res.body[0].should.have.property("description").equal("Tasks to do today, ideally");
            done();
        });
    });
});