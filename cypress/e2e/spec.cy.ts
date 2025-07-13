import { v4 as uuidv4 } from "uuid";
import { createLocalDB } from "../../data/localDB/createLocalDB";
import { setupClerkTestingToken } from "@clerk/testing/cypress";

function createReadyDB() {
  return createLocalDB().then((db) => {
    const chatTransaction = db.transaction("chat", "readwrite");
    const messageTransaction = db.transaction("message", "readwrite");
    const chat = chatTransaction.objectStore("chat");
    const message = messageTransaction.objectStore("message");
    return { chat, message };
  });
}
const ACC_LOGIN = "test";
const ACC_PASSOWRD = "pllzlpjl";

function login() {
  cy.get("#identifier-field").type(ACC_LOGIN);
  cy.get('[data-localization-key="formButtonPrimary"]').click();
  cy.get("#password-field").type(ACC_PASSOWRD);
  cy.get('[data-localization-key="formButtonPrimary"]').click();
}

describe("Whole app", () => {
  beforeEach(function () {
    // cy.origin("http://localhost:3000", () => {
    //   cy.on("uncaught:exception", (e) => {
    //     if (e.message.includes("Things went bad")) {
    //       // we expected this error, so let's ignore it
    //       // and let the test continue
    //       return false;
    //     }
    //   });
    // });
    cy.visit("http://localhost:3000/");
    setupClerkTestingToken();
    cy.wait(5000);
    createReadyDB().then(({ chat, message }) => {
      chat.clear();
      message.clear();
    });
    cy.visit("http://localhost:3000/");
  });

  it("shouldn't show input when there is no selected chat", () => {
    cy.get("[data-testid='MessageInput']").should("not.exist");
  });

  it("should create a new chat", () => {
    cy.get("[data-testid='CreateChatButton']").click({ force: true });
    cy.get("[data-testid='CreateChatDialogContent']", { timeout: 2000 }).should(
      "exist"
    );
    cy.get("[data-testid='CreateChatDialogInput']").type("New chat");
    cy.get("[data-testid='CreateChatDialogButton']").click();
    cy.get("[data-testid='CreateChatDialog']").should("not.exist");
    cy.get("[data-testid='ChatList']").should("contain", "New chat");
  });

  it("should create message in the chat", () => {
    createReadyDB().then(({ chat, message }) => {
      chat.add({ id: uuidv4(), name: "New chat" });
    });
    cy.get("[data-testid='ChatList']").within(() => {
      cy.contains("New chat").click();
    });
    cy.get("[data-testid='MessageInputTextarea']").type("Hello");
    cy.get("[data-testid='MessageInputTextarea']").type("{enter}");
    cy.get("[data-testid='MessageInputTextarea']").type("Hello2");
    cy.get("[data-testid='MessageInputSendButton']").click();
    cy.get("[data-testid='MessageList']").should("contain", "Hello");
    cy.get("[data-testid='MessageList']").should("contain", "Hello2");
  });

  it("should edit message", () => {
    createReadyDB().then(async ({ chat, message }) => {
      const chatId = uuidv4();
      chat.add({ id: chatId, name: "New chat", createdAt: new Date() });
      message.add({
        id: uuidv4(),
        chatId,
        content: "Hello",
        createdAt: new Date(),
        editedAt: new Date(),
      });
    });
    cy.get("[data-testid='ChatList']").within(() => {
      cy.contains("New chat").click();
    });
    cy.get("[data-testid='MessageList']").within(() => {
      cy.contains("Hello").rightclick();
    });
    cy.get("[data-testid='MessageDropdownMenu']", { timeout: 1000 }).should(
      "exist"
    );
    cy.get("[data-testid='MessageEditButton']").click();
    cy.get("[data-testid='EditIndicator']").should("exist");
    cy.get("[data-testid='MessageInputTextarea']").should(
      "have.value",
      "Hello"
    );
    cy.get("[data-testid='MessageInputTextarea']").clear().type("HelloEdited");
    cy.get("[data-testid='MessageInputTextarea']").type("{enter}");
    cy.get("[data-testid='MessageList']").should("contain", "HelloEdited");
  });

  it("should delete message", () => {
    createReadyDB().then(({ chat, message }) => {
      const chatId = uuidv4();
      chat.add({ id: chatId, name: "New chat", createdAt: new Date() });
      message.add({
        id: uuidv4(),
        chatId,
        content: "HelloEdited",
        createdAt: new Date(),
        editedAt: new Date(),
      });
    });
    cy.wait(1000);
    cy.get("[data-testid='ChatList']").within(() => {
      cy.contains("New chat").click();
    });
    cy.get("[data-testid='MessageList']").within(() => {
      cy.contains("HelloEdited").rightclick();
    });
    cy.get("[data-testid='MessageDropdownMenu']", { timeout: 1000 }).should(
      "exist"
    );
    cy.get("[data-testid='MessageDeleteButton']").click();
    cy.get("[data-testid='MessageList']").should("not.contain", "HelloEdited");
  });

  it("should update chat with messages", () => {
    createReadyDB().then(({ chat, message }) => {
      const chatId = uuidv4();
      chat.add({ id: chatId, name: "New chat", createdAt: new Date() });
      message.add({
        id: uuidv4(),
        chatId,
        content: "Hello2",
        createdAt: new Date(),
        editedAt: new Date(),
      });
    });
    cy.wait(1000);
    cy.get("[data-testid='ChatDropdownMenuTrigger']").click({ force: true });
    cy.get("[data-testid='ChatDropdownMenu']", { timeout: 1000 })
      .should("exist")
      .within(() => {
        cy.get("[data-testid='ChatEditButton']").click();
      });

    cy.get("[data-testid='CreateChatDialogContent']", { timeout: 1000 }).should(
      "exist"
    );
    cy.wait(1000);
    cy.get("[data-testid='CreateChatDialogInput']").type("New chat edited");
    cy.get("[data-testid='CreateChatDialogButton']").click();
    cy.get("[data-testid='CreateChatDialogContent']").should("not.exist");
    cy.get("[data-testid='ChatList']", { timeout: 200 }).should(
      "contain",
      "New chat edited"
    );
    cy.get("[data-testid='ChatList']").within(() => {
      cy.contains("New chat edited").click({ force: true });
    });
    cy.get("[data-testid='MessageList']").should("contain", "Hello2");
  });

  it("should delete chat with messages", async () => {
    createReadyDB().then(({ chat, message }) => {
      const chatId = uuidv4();
      chat.add({ id: chatId, name: "New chat", createdAt: new Date() });
      message.add({
        id: uuidv4(),
        chatId,
        content: "Hello",
        createdAt: new Date(),
        editedAt: new Date(),
      });
    });
    cy.get("[data-testid='ChatList']")
      .find("[data-testid='ChatDropdownMenuTrigger']")
      .click();
    cy.get("[data-testid='ChatDropdownMenu']", { timeout: 1000 }).should(
      "exist"
    );
    cy.get("[data-testid='ChatDeleteButton']").click();
    cy.get("[data-testid='ChatList']").should("not.contain", "New chat");
    await new Promise((res) => setTimeout(res, 4000));
    const res = await createReadyDB().then(({ message }) => {
      return new Promise((resolve) => {
        const req = message.getAll();
        req.onsuccess = () => resolve(req.result);
      });
    });
    cy.log(res as string);
    expect(res).to.have.length(0);
  });

  it("cmdk create chat", () => {
    cy.wait(1000);
    cy.get("body").type("{ctrl}k");
    cy.get("[data-testid='CommandDialogList']").should("exist");
    cy.get("[data-testid='CommandDialogCreateChat']").click();
    cy.get("[data-testid='CommandDialogList']").should("not.exist");
    cy.get("[data-testid='CreateChatDialogContent']").should("exist");
  });
});
