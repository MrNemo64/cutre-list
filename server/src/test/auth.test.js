import chai from "chai";
import chaiHttp from "chai-http";
import { app, sequelize } from "../main/app.js";
import { describe, it } from "mocha";
chai.should();

chai.use(chaiHttp);

const headers = {};

describe("Users", () => {
    before("Empty database", async () => {
        await sequelize.sync({ force: true });
    });
    after("Empty database", async () => {
        await sequelize.sync({ force: true });
    })

    it("Should create user", done => {
        chai.request(app)
            .post("/cutreapi/v1/register")
            .send({ username: "JuanElLoko", name: "Juan", password: "Juan", email: "Juan@Pedro.com" })
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.have.property("id").equal(1);
                res.body.should.have.property("name").equal("Juan");
                res.body.should.have.property("username").equal("JuanElLoko");
                res.body.should.have.property("email").equal("Juan@Pedro.com");
                res.body.should.not.have.property("password");
                done();
            });
    });

    it("Should not allow to see user without login", done => {
        chai.request(app)
            .get("/cutreapi/v1/users/1")
            .send()
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.have.property("error");
                res.body.should.have.property("message");
                done();
            });
    });

    it("Should allow to login", done => {
        chai.request(app)
            .post("/cutreapi/v1/login")
            .send({ username: "JuanElLoko", password: "Juan" })
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.have.property("token");
                headers.Authorization = `Bearer ${res.body.token}`;
                done();
            });
    });
    
    it("Can be deleted", done => {
        chai.request(app)
        .delete(`/cutreapi/v1/users/1`)
        .set(headers)
        .send()
        .end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });

    it("The token is no longer valid", done => {
        chai.request(app)
        .get(`/cutreapi/v1/users/1`)
        .set(headers)
        .send()
        .end((err, res) => {
            res.should.have.status(400);
            res.body.should.have.property("error").equal("Auth user does not exist.");
            done();
        });
    });
});