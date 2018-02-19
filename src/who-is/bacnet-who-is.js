module.exports = function(RED) {
    const Node = require('./BACnetWhoIs');
    RED.nodes.registerType('bacnet-who-is', Node(RED));
}
