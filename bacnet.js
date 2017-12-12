module.exports = function (RED) {
    const Bacnet = require('./lib/bacnet');

    /**
     * Backnet Server Node
     */
    class BacnetServerNode {
        constructor(config) {
            RED.nodes.createNode(this, config);
            this.connection = new Bacnet(config);
            this.on('close', () => this.connection.onDestroy());
        }
    }
    RED.nodes.registerType('bacnet-server', BacnetServerNode);

    /**
     * BacnetDiscovery
     * The whoIs command discovers all BACnet
     * devices in the network.
     */
    class BacnetDiscovery {
        constructor(config) {
            RED.nodes.createNode(this, config);
            this.status({fill:'green', shape: 'dot', text: 'connected'});

            const { lowLimit, highLimit, address } = config;
            const server = RED.nodes.getNode(config.server);
            server.connection.whoIs(lowLimit, highLimit, address, (device) => this.send({ device: device }));
        }
    }
    RED.nodes.registerType('bacnet-discovery', BacnetDiscovery);

    /**
     * Bacnet Read Property
     *
     * The readProperty command reads a single
     * property of an object from a device.
     */
    class BacnetReadProperty {
        constructor(config) {
            RED.nodes.createNode(this, config);
            this.server = RED.nodes.getNode(config.server);
            this.defaults = config;
            this.on('input', this.onInput);
        }

        onInput(input) {
            const { address, objectType, objectInstance, propertyId, arrayIndex } = Object.assign({}, this.defaults, input.device);
            this.server.connection.readProperty(
                address,
                objectType,
                objectInstance,
                propertyId,
                arrayIndex
            )
                .then((payload) => {
                    const message = Object.assign({}, input, { payload: payload });
                    this.send(message);
                })
                .catch((error) => this.error({ error: error }));
        };
    }
    RED.nodes.registerType('bacnet-read', BacnetReadProperty);

    /**
     * Write Property
     *
     * The writeProperty command writes a single
     * property of an object to a device.
     */
    class BacnetWriteProperty {
        constructor(config) {
            RED.nodes.createNode(this, config);
            this.server = RED.nodes.getNode(config.server);
            this.defaults = config;
            this.on('input', this.onInput);
        }

        onInput(input) {
            const valueList = [{
                type: +(input.payload.applicationTag || this.defaults.applicationTag),
                value: (input.payload.value || this.defaults.value) + Math.random() * 10000
            }];
            const { address, objectType, objectInstance, propertyId, priority } = Object.assign({}, this.defaults, input.device, input.payload);
            this.server.connection.writeProperty(
                address,
                objectType,
                objectInstance,
                propertyId,
                priority,
                valueList
            )
                .then(() => this.send(input))
                .catch((error) => this.error({ error: error }));
        }
    }
    RED.nodes.registerType('bacnet-write', BacnetWriteProperty);
    
    /**
     * Bacnet Read Property Multiple
     *
     * The readPropertyMultiple command reads multiple properties from multiple device objects
     */
    class BacnetReadPropertyMultiple {
        constructor(config) {
            RED.nodes.createNode(this, config);
            this.server = RED.nodes.getNode(config.server);
            this.defaults = config;
            this.on('input', this.onInput);
        }

        onInput(input) {
            if (!input.requestArray) {
                this.error('requestArray not provided for Bacnet read multiple.')
                return;
            }
            const { address } = Object.assign({}, this.defaults, input.device);
            this.server.connection.readPropertyMultiple(
                address,
                input.requestArray,
            )
                .then((payload) => {
                    const message = Object.assign({}, input, { payload: payload });
                    this.send(message);
                })
                .catch((error) => this.error({ error: error }));
        };
    }
    RED.nodes.registerType('bacnet-read-multiple', BacnetReadPropertyMultiple);
    
    /**
     * Bacnet Write Property Multiple
     *
     * The writePropertyMultiple command writes multiple properties to multiple device objects
     */
    class BacnetWritePropertyMultiple {
        constructor(config) {
            RED.nodes.createNode(this, config);
            this.server = RED.nodes.getNode(config.server);
            this.defaults = config;
            this.on('input', this.onInput);
        }

        onInput(input) {
            if (!input.valueList) {
                this.error('valueList not provided for Bacnet write multiple.');
                return;
            }

            const { address } = Object.assign({}, this.defaults, input.device);
            this.server.connection.writePropertyMultiple(
                address,
                input.valueList,
            )
                .then(() => this.send(input))
                .catch((error) => this.error({ error: error }));
        };
    }
    RED.nodes.registerType('bacnet-write-multiple', BacnetWritePropertyMultiple);
    
    /**
     * Bacnet Subsribe Property
     *
     * The subscribeProperty subscribes to specified property changes
     */
    class BacnetSubscribeProperty {
        constructor(config) {
            RED.nodes.createNode(this, config);
            this.subscription = null;
            this.server = RED.nodes.getNode(config.server);
            this.defaults = config;
            this.on('input', this.onInput);
            this.on('close', this.unsubscribe);
        }

        onInput(input) {
            const { address, objectType, objectInstance, propertyId, arrayIndex, subscribeId, issueConfirmedNotifications } = Object.assign({}, this.defaults, input.device);

            const device = { type: objectType, instance: objectInstance };
            const property = { propertyIdentifier: propertyId, propertyArrayIndex: arrayIndex };

            // Unsubscribe before subscribing again
            this.unsubscribe()
                .then(() => this.server.connection.subscribeProperty(
                    address,
                    device,
                    property,
                    subscribeId,
                    issueConfirmedNotifications,
                    (payload) => {
                        const message = Object.assign({}, input, { payload: payload })
                        this.send(message);
                    })
                )
                .then(() => this.subscription = {
                    address: address,
                    device: device,
                    property: property,
                    subscribeId: subscribeId
                })
                .catch((error) => this.error({ error: error }));
        };

        unsubscribe() {
            if (!this.subscription || !this.server.connection.client) { return Promise.resolve(); }

            return this.server.connection.unsubscribeProperty(
                this.subscription.address,
                this.subscription.subscribeId,
                this.subscription.device,
                this.subscription.property
            )
                .then(() => this.subscription = null)
                .catch((error) => this.error({ error: error }));
        }
    }
    RED.nodes.registerType('bacnet-subscribe-property', BacnetSubscribeProperty);
    
    /**
     * Bacnet Subsribe COV
     *
     * The subscribeCOV subscribes to all specified object changes
     */
    class BacnetSubscribeCOV {
        constructor(config) {
            RED.nodes.createNode(this, config);
            this.subscription = null;
            this.server = RED.nodes.getNode(config.server);
            this.defaults = config;
            this.on('input', this.onInput);
            this.on('close', this.unsubscribe);
        }

        onInput(input) {
            const { address, objectType, objectInstance, subscribeId, issueConfirmedNotifications, lifetime } = Object.assign({}, this.defaults, input.device);

            const device = { type: objectType, instance: objectInstance };

            // Unsubscribe before subscribing again
            this.unsubscribe()
                .then(() => this.server.connection.subscribeCOV(
                    address,
                    device,
                    subscribeId,
                    issueConfirmedNotifications,
                    lifetime,
                    (payload) => {
                        const message = Object.assign({}, input, { payload: payload })
                        this.send(message);
                    })
                )
                .then(() => this.subscription = {
                    address: address,
                    device: device,
                    subscribeId: subscribeId
                })
                .catch((error) => this.error({ error: error }));
        };

        unsubscribe() {
            if (!this.subscription || !this.server.connection.client) { return Promise.resolve(); }

            return this.server.connection.unsubscribeCOV(
                this.subscription.address,
                this.subscription.subscribeId,
                this.subscription.device
            )
                .then(() => this.subscription = null)
                .catch((error) => this.error({ error: error }));
        }
    }
    RED.nodes.registerType('bacnet-subscribe-cov', BacnetSubscribeCOV);
};
