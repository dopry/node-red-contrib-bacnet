const bacnet = require('bacstack');

class Bacnet {
    constructor(options) {
        this.options = options;
        this.devices = new Map();
        this.subscriptions = {};
        this.connect(this.options);
    }

    onDestroy() {
        if (this.client) {
            this.client.removeAllListeners('iAm');
            this.client.removeAllListeners('covNotify');
            this.client.removeAllListeners('covNotifyUnconfirmed');
            this.client.close();
            this.client = null;
        }
    }

    connect(options) {
        this.client = new bacnet(options);

        this.client.on('iAm', (device) => this.onDeviceAdded(device));
        this.client.on('covNotify', (data) => {
            if (!this.hasSubscription(data.address, data.request.subscriberProcessIdentifier)) { return; }

            this.client.simpleAckResponse(data.address, bacnet.enum.BacnetConfirmedServices.SERVICE_CONFIRMED_COV_NOTIFICATION, data.invokeId);
            this.subscriptions[data.address][data.request.subscriberProcessIdentifier](data.request.values);
        })
        this.client.on('covNotifyUnconfirmed', (data) => {
            if (!this.hasSubscription(data.address, data.request.subscriberProcessIdentifier)) { return; }
            
            this.subscriptions[data.address][data.request.subscriberProcessIdentifier](data.request.values);
        })
    }

    onDeviceAdded(device) {
        this.devices.set(device.deviceId, device);
    }
    
    whoIs(lowLimit, highLimit, address, deviceListener) {
        lowLimit = this.toNumber(lowLimit);
        highLimit = this.toNumber(highLimit);
        this.client.on('iAm', deviceListener);
        this.client.whoIs(lowLimit, highLimit, address);
    }

    readProperty(address, objectType, objectInstance, propertyId, arrayIndex) {
        return new Promise((resolve, reject) => {
            if (!this.client) { return reject('Not connected'); }

            this.client.readProperty(address, objectType, objectInstance, propertyId, arrayIndex, (err, value) => err ? reject(err) : resolve(value));
        });
    }

    writeProperty(address, objectType, objectInstance, propertyId, priority, valueList) {
        priority = this.toNumber(priority) || 1;
        
        return new Promise((resolve, reject) => {
            if (!this.client) { return reject('Not connected'); }

            this.client.writeProperty(address, objectType, objectInstance, propertyId, priority, valueList, (err, value) => err ? reject(err) : resolve(value));
        });
    }

    readPropertyMultiple(address, requestArray) {
        return new Promise((resolve, reject) => {
            if (!this.client) { return reject('Not connected'); }

            this.client.readPropertyMultiple(address, requestArray, (err, value) => err ? reject(err) : resolve(value));
        });
    }
    
    writePropertyMultiple(address, valueList) {
        return new Promise((resolve, reject) => {
            if (!this.client) { return reject('Not connected'); }

            this.client.writePropertyMultiple(address, valueList, (err, value) => err ? reject(err) : resolve(value));
        });
    }

    subscribeProperty(address, objectId, propertyId, subscribeId, issueConfirmedNotifications, listener) {
        return new Promise((resolve, reject) => {
            if (!this.client) { return reject('Not connected'); }

            this.client.subscribeProperty(address, objectId, propertyId, subscribeId, false, issueConfirmedNotifications, (err, value) => {
                if (err) { return reject(err); }

                this.subscriptions[address] = Object.assign({}, this.subscriptions[address], { [subscribeId]: listener });
                return resolve(value);
            });
        });
    }
    
    subscribeCOV(address, objectId, subscribeId, issueConfirmedNotifications, lifetime, listener) {
        return new Promise((resolve, reject) => {
            if (!this.client) { return reject('Not connected'); }
            
            this.client.subscribeCOV(address, objectId, subscribeId, false, issueConfirmedNotifications, lifetime, (err, value) => {
                if (err) { return reject(err); }
                
                this.subscriptions[address] = Object.assign({}, this.subscriptions[address], { [subscribeId]: listener });
                return resolve(value);
            });
        })
    }

    unsubscribeProperty(address, subscribeId, objectId, propertyId) {
        return new Promise((resolve, reject) => {
            if (!this.client) { return reject('Not connected'); }
            if (!this.hasSubscription(address, subscribeId)) { return reject('Not subscribed'); }

            this.client.subscribeProperty(address, objectId, propertyId, subscribeId, true, null, (err, value) => {
                if (err) { return reject(err); }

                delete this.subscriptions[address][subscribeId];
                return resolve(value);
            });
        })
    }
    
    unsubscribeCOV(address, subscribeId, objectId) {
        return new Promise((resolve, reject) => {
            if (!this.client) { return reject('Not connected'); }
            if (!this.hasSubscription(address, subscribeId)) { return reject('Not subscribed'); }

            this.client.subscribeCOV(address, objectId, subscribeId, true, null, null, (err, value) => {
                if (err) { return reject(err); }

                delete this.subscriptions[address][subscribeId];
                return resolve(value);
            });
        })
    }

    hasSubscription(address, subscriptionId) {
        return this.subscriptions[address] && this.subscriptions[address][subscriptionId];
    }

    toNumber(value) {
        return isNaN(parseInt(value)) ? undefined : +value;
    }
}

module.exports = Bacnet;
