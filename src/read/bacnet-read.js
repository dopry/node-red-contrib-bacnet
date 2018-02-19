module.exports = function(RED) {
    const Node = require('./BacnetRead');
    RED.nodes.registerType('bacnet-read-property', Node(RED));
}
