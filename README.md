# cypress-websocket-plugin

> Cypress plugin for mocking websockets (socket.io version 2)

## Requirements

* `Cypress 10.x`

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

### Caveats

* port is not configurable, it's fixed as `3000`. This is on my list.
* this plugin was tested and works with Socket.IO version 2 only.

### Example usage

Imagine you have application, that after clicking on some button will issue two
messages over WebSocket:

* "hey, I just met you", args: "and this is craAAzy"
* "but here's my number", args: "so call me maybe"

This is how it would be tested with the plugin:

```js
beforeEach(() => {
  // we don't want any messages from previous test runs
  cy.resetWsMessages();
});

describe('empty spec', () => {
  it('passes', () => {
    // cy.visit(someUrl);
    // cy.get("#btn").click();
    // ...

    // actual check  <-------
    cy.expectWsMessages(
        [
            ["hey, I just met you", "and this is craAAzy"],
            ["but here's my number", "so call me maybe"],
        ]
    );
```

### Modyfying dynamic variables - example

TODO (you can control values returned by the server from the test easily)

### Changing behavior of the websocket server / overriding options - example

TODO (you can completely change how server behaves in run-time, or before each test)
