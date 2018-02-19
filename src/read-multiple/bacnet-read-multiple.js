module.exports = function(RED) {
    const Node = require('./BacnetReadMultiple');
    RED.nodes.registerType('bacnet-read-multiple', Node(RED));
}
