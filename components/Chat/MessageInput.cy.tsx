import React from "react";
import MessageInput from "./MessageInput";
import "@/app/globals.css";
import { DBService } from "@/data/DBService";

describe("<MessageInput />", () => {
  it("renders", async () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <html lang="en">
        <head>
          <link rel="stylesheet" href="/globals.css" />
          <title>Document</title>
        </head>
        <body>
          <MessageInput />
        </body>
      </html>
    );
    const chatService = new DBService("chat");
    cy.wrap(
      chatService.create({
        id: "6",
        name: "test",
        messages: [],
      })
    ).then(() => {
      chatService.getAll().then((chats) => {
        cy.log(chats);
      });
    });
  });
});
