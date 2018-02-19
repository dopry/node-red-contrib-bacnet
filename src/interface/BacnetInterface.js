function BacnetInterfaceNodeFactory(RED) {
    const BacnetApi = require('./BacnetApi');
   
    /**
     * Configuration Node
     */
    class BacnetInterfaceNode {
        constructor(config) {
            RED.nodes.createNode(this, config);
            this.client = new BacnetApi(config);
        }
    }

    return BacnetInterfaceNode;
}

module.exports = BacnetInterfaceNodeFactory;
