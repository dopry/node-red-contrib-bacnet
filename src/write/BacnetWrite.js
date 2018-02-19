function BacnetWriteNode(RED) {
    const BaseNode = require('../BaseNode');

    /**
     * Write Property
     *
     * The writeProperty command writes a single
     * property of an object to a device.
     */
    class BacnetWrite extends BaseNode {
        constructor(config) {
            super(RED, config);
        }

        onInput(input) {
            const options = Object.assign({}, this.config, input.payload);
            const { address, objectType, objectInstance, propertyId, priority, valueList } = options;
           
            this.bacnet.client.writeProperty(
                address,
                objectType,
                objectInstance,
                propertyId,
                priority,
                valueList
            )
            .then((payload) => {
                const message = Object.assign({}, input, { payload: payload });
                this.bacnet.client.send(input)
            })
            .catch((error) => this.error({ error: error }));
        }
    }

    return BacnetWrite;
}

module.exports = BacnetWriteNode;
