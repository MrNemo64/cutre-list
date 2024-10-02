import chai from "chai";
import chaiHttp from "chai-http";
import { app, sequelize } from "../main/app.js";
import { describe, it } from "mocha";
import { createUserAndGetToken } from "./util.js";
chai.should();

chai.use(chaiHttp);

let headers = {};
let user;

describe("Tray", () => {
    before("Empty database and obtain auth token", async () => {
        await sequelize.sync({ force: true });
        const [u, token] = await createUserAndGetToken();
        headers.Authorization = `Bearer ${token.generateJWT()}`;
        user = u;
    });
    after("Empty database", async () => {
        await sequelize.sync({ force: true });
    })

    it("Should have an user", done => {
        chai.request(app)
            .get(`/cutreapi/v1/users/${user.id}`)
            .set(headers)
            .send()
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property("id").equal(user.id);
                res.body.should.have.property("name").equal("Juan");
                res.body.should.have.property("username").equal("JuanElLoko");
                res.body.should.have.property("email").equal("juan@el.loko");
                res.body.should.not.have.property("password");
                done();
            });
    });

});