module.exports = function(RED) {
    const Node = require('./BacnetWriteMultiple');
    RED.nodes.registerType('bacnet-write-multiple', Node(RED));
}
