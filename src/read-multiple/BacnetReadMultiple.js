const BaseNode = require('../BaseNode');

function BacnetReadMultipleFactory(RED) {
    /**
     * Bacnet Read Property Multiple
     *
     * The readProperty command reads a single
     * property of an object from a device.
     */
    class BacnetReadMultiple extends BaseNode {
        constructor(config) {
            super(RED, config);
        }

        onInput(input) {
            const { address, requestArray } = Object.assign({}, this.config, input.payload);
            this.bacnet.client.readPropertyMultiple(address, requestArray)
                .then((response) => {
                    const message = Object.assign({}, input, { payload: response });
                    this.bacnet.client.send(message);
                })
                .catch((error) => this.error({ error: error }));
        };
    }

    return BacnetReadMultiple;
}

module.exports = BacnetReadMultipleFactory;