module.exports = function(RED) {
    const Node = require('./BacnetIAm');
    RED.nodes.registerType('bacnet-iam', Node(RED));
}
