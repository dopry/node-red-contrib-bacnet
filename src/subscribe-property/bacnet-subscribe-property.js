module.exports = function(RED) {
    const Node = require('./BACnetSubscribeProperty');
    RED.nodes.registerType('bacnet-subscribe-property', Node(RED));
}
