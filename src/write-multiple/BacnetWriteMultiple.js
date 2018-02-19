const BaseNode = require('../BaseNode');

function BacnetWriteMultipleNode(RED) {
    /**
     * Bacnet Write Property Multiple
     *
     * The WritePropertyMultiple command writes multiple properties to an object. 
     */
    class BacnetWriteMultiple extends BaseNode {
        constructor(config) {
            super(RED, config);
        }

        onInput(input) {
            if (!input.valueList) {
                this.error('valueList not provided for Bacnet write multiple.');
                return;
            }

            const { address } = Object.assign({}, this.defaults, input.device);
            this.bacnet.client.writePropertyMultiple(address, input.valueList)
                .then(() => this.bacnet.client.send(input))
                .catch((error) => this.error({ error: error }));
        };
    }
    return BacnetWriteMultiple;
}

module.exports = BacnetWriteMultipleNode;
