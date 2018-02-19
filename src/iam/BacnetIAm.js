const BaseNode = require('../BaseNode');

function BacnetIAmNode(RED) {
    /**
     * Bacnet IAm
     *
     * Handle and emit IAm messages.
     */
    class IAmNode extends BaseNode {
        constructor(config) {
            super(RED, config);
            this.bacnet.client.on('iAm', this.onIam);
        }

        onIam(input) {
            this.sent(input);
        }
    }

    return IAmNode;
}

module.exports = BacnetIAmNode;