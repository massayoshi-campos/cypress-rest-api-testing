import "../../services/user/UserService";

describe("User API", () => {
  context("REST Feature", { tags: "rest" }, () => {
    it("POST - should create a new user successfully", () => {
      cy.fixture("user/user.json").then((userData) => {
        cy.validateDetailsResponse(
          () => cy.serviceToUser.createUser(userData),
          200,
          "OK",
          true,
        ).then((res) => {
          const responseBody = res.body;

          expect(responseBody).to.be.an("object");
          expect(responseBody).to.have.property("code", 200);
          expect(responseBody).to.have.property("type");
          expect(responseBody.message).to.eq(String(userData.id));
        });
      });
    });

    it("GET - should return the user by username", () => {
      cy.fixture("user/user.json").then((userData) => {
        cy.validateDetailsResponse(
          () => cy.serviceToUser.getUserByUsername(userData.username),
          200,
          "OK",
          true,
        ).then((res) => {
          const responseBody = res.body;

          expect(responseBody).to.be.an("object");
          expect(responseBody).to.have.property("id", userData.id);
          expect(responseBody).to.have.property("username", userData.username);
          expect(responseBody).to.have.property(
            "firstName",
            userData.firstName,
          );
          expect(responseBody).to.have.property("lastName", userData.lastName);
          expect(responseBody).to.have.property("email", userData.email);
          expect(responseBody).to.have.property("phone", userData.phone);
          expect(responseBody).to.have.property(
            "userStatus",
            userData.userStatus,
          );
        });
      });
    });

    it("PUT - should update the user successfully", () => {
      cy.fixture("user/user.json").then((userData) => {
        const updatedUser = {
          ...userData,
          firstName: "UpdatedCypress",
          lastName: "UpdatedTest",
          email: "updated.cypress.user.7001@example.com",
          phone: "11912345678",
          userStatus: 2,
        };

        cy.validateDetailsResponse(
          () => cy.serviceToUser.updateUser(userData.username, updatedUser),
          200,
          "OK",
          true,
        ).then((res) => {
          const responseBody = res.body;

          expect(responseBody).to.be.an("object");
          expect(responseBody).to.have.property("code", 200);
          expect(responseBody).to.have.property("type");
          expect(responseBody.message).to.eq(String(userData.id));
        });

        // GET - Verify the updated user
        cy.serviceToUser.getUserByUsername(userData.username).then((getRes) => {
          expect(getRes.status).to.eq(200);
          expect(getRes.body.username).to.eq(userData.username);
          expect(getRes.body.firstName).to.eq(updatedUser.firstName);
          expect(getRes.body.lastName).to.eq(updatedUser.lastName);
          expect(getRes.body.email).to.eq(updatedUser.email);
          expect(getRes.body.phone).to.eq(updatedUser.phone);
          expect(getRes.body.userStatus).to.eq(updatedUser.userStatus);
        });
      });
    });

    it("DELETE - should delete the user successfully", () => {
      cy.fixture("user/user.json").then((userData) => {
        cy.validateDetailsResponse(
          () => cy.serviceToUser.deleteUser(userData.username),
          200,
          "OK",
          true,
        ).then((res) => {
          const responseBody = res.body;

          expect(responseBody).to.be.an("object");
          expect(responseBody).to.have.property("code", 200);
          expect(responseBody).to.have.property("type");
          expect(responseBody.message).to.eq(userData.username);
        });

        // GET - Verify the user was deleted
        cy.serviceToUser.getUserByUsername(userData.username).then((getRes) => {
          expect(getRes.status).to.eq(404);
        });
      });
    });

    it("GET - should login successfully with valid credentials", () => {
      cy.fixture("user/user.json").then((userData) => {
        cy.serviceToUser.createUser(userData).then((createRes) => {
          expect(createRes.status).to.eq(200);

          cy.serviceToUser
            .login(userData.username, userData.password)
            .then((loginRes) => {
              expect(loginRes.status).to.eq(200);
              expect(loginRes.body).to.be.an("object");
              expect(loginRes.body).to.have.property("code", 200);
              expect(loginRes.body).to.have.property("type");
              expect(loginRes.body).to.have.property("message");

              expect(loginRes.headers).to.have.property("x-expires-after");
              expect(loginRes.headers).to.have.property("x-rate-limit");
            })
            .then(() => {
              return cy.serviceToUser.deleteUser(userData.username);
            })
            .then((deleteRes) => {
              expect(deleteRes.status).to.eq(200);
            });
        });
      });
    });

    it("GET - should logout successfully", () => {
      cy.serviceToUser.logout().then((res) => {
        cy.log(`HTTP status: ${res.status}`);
        cy.log(`Response body: ${JSON.stringify(res.body)}`);

        expect(res.status).to.eq(200);
      });
    });

    it("POST - should create users with an array successfully", () => {
      cy.fixture("user/usersArray.json").then((usersData) => {
        cy.serviceToUser.createUsersWithArray(usersData).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("code", 200);
          expect(res.body).to.have.property("type");
          expect(res.body).to.have.property("message", "ok");
        });

        // GET - Verify each user was created
        usersData.forEach((userData) => {
          cy.serviceToUser
            .getUserByUsername(userData.username)
            .then((getRes) => {
              expect(getRes.status).to.eq(200);
              expect(getRes.body).to.have.property("id", userData.id);
              expect(getRes.body).to.have.property(
                "username",
                userData.username,
              );
              expect(getRes.body).to.have.property(
                "firstName",
                userData.firstName,
              );
              expect(getRes.body).to.have.property(
                "lastName",
                userData.lastName,
              );
              expect(getRes.body).to.have.property("email", userData.email);
            });
        });

        // DELETE - Clean up created users
        usersData.forEach((userData) => {
          cy.serviceToUser.deleteUser(userData.username).then((deleteRes) => {
            expect(deleteRes.status).to.eq(200);
          });
        });
      });
    });

    it("POST - should create users with a list successfully", () => {
      cy.fixture("user/usersList.json").then((usersData) => {
        cy.serviceToUser.createUsersWithList(usersData).then((res) => {
          cy.log(`HTTP status: ${res.status}`);
          cy.log(`Response body: ${JSON.stringify(res.body)}`);

          expect(res.status).to.eq(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("code", 200);
          expect(res.body).to.have.property("type");
          expect(res.body).to.have.property("message", "ok");
        });

        // GET - Verify each user was created
        usersData.forEach((userData) => {
          cy.serviceToUser
            .getUserByUsername(userData.username)
            .then((getRes) => {
              expect(getRes.status).to.eq(200);
              expect(getRes.body).to.have.property("id", userData.id);
              expect(getRes.body).to.have.property(
                "username",
                userData.username,
              );
              expect(getRes.body).to.have.property(
                "firstName",
                userData.firstName,
              );
              expect(getRes.body).to.have.property(
                "lastName",
                userData.lastName,
              );
              expect(getRes.body).to.have.property("email", userData.email);
            });
        });

        // DELETE - Clean up created users
        usersData.forEach((userData) => {
          cy.serviceToUser.deleteUser(userData.username).then((deleteRes) => {
            expect(deleteRes.status).to.eq(200);
          });
        });
      });
    });
  });
});

describe("Negative Test Scenarios", () => {
  context("REST Feature", { tags: "rest" }, () => {
    it("GET - should return 404 for a non-existent user", () => {
      const username = "cypress_user_not_found_9999";

      cy.serviceToUser.getUserByUsername(username).then((res) => {
        cy.log(`HTTP status: ${res.status}`);
        cy.log(`Response body: ${JSON.stringify(res.body)}`);

        expect(res.status).to.eq(404);
        expect(res.body).to.have.property("code", 1);
        expect(res.body).to.have.property("type", "error");
        expect(res.body).to.have.property("message", "User not found");
      });
    });
  });
});
