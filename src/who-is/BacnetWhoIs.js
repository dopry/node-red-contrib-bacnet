const BaseNode = require('../BaseNode');

function BacnetWhoIsNode(RED) {
    /**
     * BacnetWhoIs
     * Send to WhoIs message to trigger device discovery.  
     */
    class BacnetWhoIs extends BaseNode {

        constructor(config) {
            super(RED, config);
        }

        onInput(msg) {
            const options = Object.assign({}, this.config, msg.payload);
            const { lowLimit, highLimit, address } = options;
            this.bacnet.client.whoIs(lowLimit, highLimit, address);
        }
    }

    return BacnetWhoIs;
}

module.exports = BacnetWhoIsNode;
