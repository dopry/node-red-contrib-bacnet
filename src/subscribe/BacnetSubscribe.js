const BaseNode = require('../BaseNode');

function BacnetSubscribeFactory(RED) {

    
    class BacnetSubscribe extends BaseNode {
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
            const {address, objectType, objectInstance, subscribeId, issueConfirmedNotifications, lifetime} = this.config;
            const objectId = { type: objectType, instance: objectInstance };
            return this.bacnet.client.subscribeCOV(address, objectId, subscribeId, issueConfirmedNotifications, lifetime, {}, this.onCOV.bind(this));  
        }

        unsubscribe() {
            const {address, objectType, objectInstance, subscribeId, issueConfirmedNotifications, lifetime} = this.config;
            const objectId = { type: objectType, instance: objectInstance };
            return this.bacnet.client.unsubscribeCOV(address, objectId, subscribeId, this.onCOV.bind(this) );  
        }
    }

    return BacnetSubscribe;
}

module.exports = BacnetSubscribeFactory;
