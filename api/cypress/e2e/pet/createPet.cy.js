import "../../services/pet/createPetService";

describe("Petstore API - Pet CRUD Flow (Create, Read, Update, Find, Delete) - Positive Test Scenario", () => {
  context("REST Feature", { tags: "rest" }, () => {
    it(`POST - should create a new pet successfully`, () => {
      cy.fixture("pet/test_b.json").then((requestData) => {
        cy.validateDetailsResponse(
          () => cy.serviceToPet.createPet(requestData),
          200,
          "OK",
          true
        ).then((res) => {
          const responseBody = res.body;

          expect(responseBody).to.have.property("id", 337);
          expect(responseBody).to.have.property("name", "Golden Retriever");
          expect(responseBody.status).to.eq("available");

          expect(responseBody.category).to.deep.equal({
            id: 12,
            name: "Dogs",
          });

          expect(responseBody.photoUrls[0]).to.eq(
            "https://images.pets.com/golden-retriever-101.jpg"
          );

          expect(responseBody.tags[0]).to.deep.equal({
            id: 5,
            name: "vaccinated",
          });
        });
      });
    });

    it("GET - should return the pet by id", () => {
      cy.validateDetailsResponse(
        () => cy.serviceToPet.getPetById(337),
        200,
        "OK",
        true
      ).then((res) => {
        const responseBody = res.body;

        expect(responseBody).to.have.property("id", 337);
        expect(responseBody).to.have.property("name", "Golden Retriever");
        expect(responseBody.status).to.eq("available");

        expect(responseBody.category).to.deep.equal({
          id: 12,
          name: "Dogs",
        });

        expect(responseBody.photoUrls[0]).to.eq(
          "https://images.pets.com/golden-retriever-101.jpg"
        );

        expect(responseBody.tags[0]).to.deep.equal({
          id: 5,
          name: "vaccinated",
        });
      });
    });

    it(`PUT - should update the pet successfully`, () => {
      cy.fixture("pet/test_c.json").then((requestData) => {
        cy.validateDetailsResponse(
          () => cy.serviceToPet.updatePet(requestData),
          200,
          "OK",
          true
        ).then((res) => {
          const responseBody = res.body;

          expect(responseBody).to.have.property("id", 337);
          expect(responseBody).to.have.property("name", "Persa");
          expect(responseBody.status).to.eq("pending");

          expect(responseBody.category).to.deep.equal({
            id: 13,
            name: "Cats",
          });

          expect(responseBody.photoUrls[0]).to.eq(
            "https://images.pets.com/persa-104.jpg"
          );

          expect(responseBody.tags[0]).to.deep.equal({
            id: 6,
            name: "vaccinated",
          });
        });
      });
    });

    it(`GET - should find the updated pet by status`, () => {
      cy.validateDetailsResponse(
        () => cy.serviceToPet.getPetsByStatus("pending"),
        200,
        "OK",
        true
      ).then((res) => {
        const responseBody = res.body;
        expect(responseBody).to.be.an("array");
        const pet = responseBody.find((p) => p.id === 337);
        expect(pet, "Pet with id 337 should exist in findByStatus").to.not.be
          .undefined;
        expect(pet.id).to.eq(337);
        expect(pet.name).to.eq("Persa");
        expect(pet.status).to.eq("pending");
        expect(pet.category).to.deep.equal({
          id: 13,
          name: "Cats",
        });
        expect(pet.photoUrls[0]).to.eq("https://images.pets.com/persa-104.jpg");
        expect(pet.tags[0]).to.deep.equal({
          id: 6,
          name: "vaccinated",
        });
      });
    });

    it(`DELETE - should delete the pet successfully`, () => {
      cy.validateDetailsResponse(
        () => cy.serviceToPet.deletePetById(337),
        200,
        "OK",
        true
      ).then((res) => {
        const responseBody = res.body;
        expect(responseBody).to.have.property("code", 200);
        expect(responseBody).to.have.property("type");
        expect(responseBody).to.have.property("message", "337");
      });
    });

    it("GET - should return 404 after pet is deleted", () => {
      cy.serviceToPet.getPetById(337).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.message).to.eq("Pet not found");
      });
    });

    it("POST - should allow recreating the pet after deletion", () => {
      cy.fixture("pet/test_b.json").then((requestData) => {
        cy.serviceToPet.createPet(requestData).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.id).to.eq(337);
        });
      });
    });

    it("GET - should return a valid pet contract", () => {
      cy.serviceToPet.getPetById(337).then((res) => {
        expect(res.body).to.have.all.keys(
          "id",
          "category",
          "name",
          "photoUrls",
          "tags",
          "status"
        );
      });
    });

    it("PUT - should allow updating the pet multiple times", () => {
      cy.fixture("pet/test_c.json").then((update1) => {
        cy.serviceToPet.updatePet(update1);
      });

      cy.fixture("pet/test_b.json").then((update2) => {
        cy.serviceToPet.updatePet(update2).then((res) => {
          expect(res.body.name).to.eq("Golden Retriever");
        });
      });
    });

    it("GET - should return the same data on repeated calls", () => {
      cy.serviceToPet.getPetById(337).then((res1) => {
        cy.serviceToPet.getPetById(337).then((res2) => {
          expect(res1.body).to.deep.equal(res2.body);
        });
      });
    });
  });
});

describe("Petstore API - Authentication and Validation - Negative Test Scenarios", () => {
  context("REST Feature", { tags: "rest" }, () => {
    it("POST - should not accept invalid data types", () => {
      const invalidBody = {
        id: "ABC",
        name: true,
        status: 999,
      };

      cy.apiKeyRequestWithJsonBody("POST", "pet", invalidBody).then((res) => {
        expect(res.status).to.eq(500);
      });
    });

    it("GET - should return 404 for wrong endpoint", () => {
      cy.serviceToPet.callWrongEndpoint().then((res) => {
        expect(res.status).to.eq(404);
      });
    });

    it("PATCH - should reject unsupported HTTP method", () => {
      cy.serviceToPet.callInvalidMethod().then((res) => {
        expect(res.status).to.be.oneOf([400, 405]);
      });
    });
  });
});
