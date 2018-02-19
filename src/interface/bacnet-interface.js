/** 
 * Config
 */
module.exports = function(RED) {
    const BacnetInterface = require('./BacnetInterface');
    RED.nodes.registerType('bacnet-interface', BacnetInterface(RED));
}
