//const Node = require('node-red/red/runtime/nodes/Node');
/**
 * Extend core Node object to create a base for using inheritance in place of RED.nodes.createNode; 
 */

// I was getting cyclical dependency issues with this implementation extensing from Node using the super() constructor. 
// So I switched back to use RED.nodes.createNode(...); Which I don't like from an OO perspecting.. I would like to see the 
// pass along an out of band RED singleton thing disappear completely. 
//
// class BaseNode extends Node {
//     /**
//      * @param {RED} RED Node red instance injected at runtime.
//      * @param {config} Node config from the NodeRed UI.  
//      */
//     constructor(RED, config) {
//         super(config);
//         this.RED = RED;
//         this.config = config;
//         this.bacnet = RED.nodes.getNode(this.config.bacnetInterface);
//         this.on('input', this.onInput);
//     }

//     /**
//      * Virtual OnInput method. 
//      * Node classes should implement their own handlers
//      */
//     onInput() {}
// }

class BaseNode {
    /**
     * @param {RED} RED Node red instance injected at runtime.
     * @param {config} Node config from the NodeRed UI.  
     */
    constructor(RED, config) {
        this.RED = RED;
        RED.nodes.createNode(this, config);
        this.config = config;
        this.bacnet = RED.nodes.getNode(this.config.bacnetInterface);
        this.on('input', this.onInput);
    }

    /**
     * Virtual OnInput method. 
     * Node classes should implement their own handlers
     */
    onInput() {}
}

module.exports = BaseNode;
