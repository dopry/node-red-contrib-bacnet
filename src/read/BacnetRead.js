const BaseNode = require('../BaseNode');

function BacnetRead(RED) {
    /**
     * Bacnet Read Property
     *
     * The readProperty command reads a single
     * property of an object from a device.
     */
    class ReadProperty extends BaseNode {
        constructor(config) {
            super(RED, config);
        }

        onInput(input) {
            const options = Object.assign({}, this.config, input.payload);
            const { address, objectType, objectInstance, propertyId, arrayIndex } = options;
            this.bacnet.client.readProperty(address, objectType, objectInstance, propertyId, arrayIndex)
                .then((payload) => {
                    const message = Object.assign({}, input, { payload: payload });
                    this.bacnet.client.send(message);
                })
                .catch((error) => this.error({ error: error }));
        }
    }

    return ReadProperty;
}

module.exports = BacnetRead;