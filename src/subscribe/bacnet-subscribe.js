module.exports = function(RED) {
    const Node = require('./BacnetSubscribe');
    RED.nodes.registerType('bacnet-subscribe', Node(RED));
}
