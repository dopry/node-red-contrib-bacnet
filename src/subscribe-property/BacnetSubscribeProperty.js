const BaseNode = require('../BaseNode');

function BacnetSubscribePropertyNode(RED) {

    class BacnetSubscribeProperty extends BaseNode {
        constructor(config) {
            super(RED, config);
            this.subscribe();
            this.on('close', this.onClose);
        }
        
        onClose() {
            this.unsubscribe();
        }

        onCOV(value) {
            const message = { payload: value };
            this.send(message);
        }

        subscribe() {
            let {address, objectType, objectInstance, propertyId, subscribeId, issueConfirmedNotifications} = this.config;
            let objectId = { type: objectType, instance: objectInstance };
            return this.bacnet.client.subscribeProperty(
                    address,
                    objectId,
                    propertyId,
                    subscribeId,
                    issueConfirmedNotifications,
                    {},
                    this.onCOV.bind(this)
                );
        }

        unsubscribe() {
            if (!this.subscription || !this.bacnet.client) { return Promise.resolve(); }

            return this.bacnet.client.unsubscribeProperty(
                this.subscription.address,
                this.subscription.subscribeId,
                this.subscription.device,
                this.subscription.property,
                this.onCOV.bind(this)
            );
        }
    }

    return BacnetSubscribeProperty;
}

module.exports = BacnetSubscribePropertyNode;
