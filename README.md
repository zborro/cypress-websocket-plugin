# cypress-websocket-plugin

> Cypress plugin for mocking websockets (socket.io version 2)

WARNING: This is experimental software. It works and was tested against socket.io version 2 only.

Once it's battle-tested in one of my projects I will document it.

## Installation

```shell
npm i -D cypress-websocket-plugin
```

## Usage

First, integrate plugin with your Cypress setup:

1. Edit file `cypress.config.ts`. Following example will let the websocket server respond
   to `hello` by echoing it back with an argument. It will also send `ping` message every
   5 seconds with value coming from dynamic variable (initially set to 42). Code in the
   test can modify this variable to change behavior in run-time.
```js
import { startFakeWebsocketServer } from "cypress-websocket-plugin";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      startFakeWebsocketServer({
        options: {
            responses: {
                'hello': ['hello', 'dear'],
            },
            periodicMessages: [
                {"name": "ping", "args": ["$dynamicVariable"], "interval": 5000},
            ]
        },
        variables: {
            "dynamicVariable": 42,
        },
      });
    },
  },
});
```
2. Edit file `cypress/support/commands.ts`. Add:
```js
import { addCommands } from "cypress-websocket-plugin/commands.js";

addCommands();
```

### Example usage

```js
beforeEach(() => {
  // we don't want any messages from previous test runs
  cy.resetWsMessages();
});

describe('empty spec', () => {
  it('passes', () => {
    // do whatever you want, like cy.visit etc
    // ...

    // then, if app was supposed to send WS messages, we can check it
    cy.expectWsMessages(
        [
            ["hey, I just met you", "and this is craAAzy"],
            ["but here's my number", "so call me maybe"],
        ]
    );
```
