module.exports = function(RED) {
    const Node = require('./BACnetWrite');
    RED.nodes.registerType('bacnet-write', Node(RED));
}
