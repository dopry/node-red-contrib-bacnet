const bacstack = require('bacstack');
/** 
 * Extend bacstack to return promises, track seen devices, and subscriptions.
 */
class BacnetApi extends bacstack {
    static iAmHandler(device) {
        // add a device to the device registry when we see an iAm broadcast.
        this.devices.set(device.deviceId, device);
    }

    static covNotifyHandler(data) {
        // let event = this.covSubscriptionGetEvent(data.address, data.request.subscriberProcessIdentifier);
        // let listeners = this.listeners(event);
        // // check that we have a listener.
        // if (!listeners || listeners.length == 0) {
        //     return;
        // }
        // // acknowledge when confirmation required.
        // this.simpleAckResponse(data.address, bacnet.enum.BacnetConfirmedServices.SERVICE_CONFIRMED_COV_NOTIFICATION, data.invokeId);
        // this.emit(event, data);
    }

    static covNotifyUnconfirmedHandler(data) {
        // let event = this.covSubscriptionGetEvent(data.address, data.request.subscriberProcessIdentifier);
        // let listeners = this.listeners(event);
        // if (!listeners || listeners.length == 0) {
        //     return;
        // }
        // this.emit(event, data);
    }

    constructor(options) {
        super(options);
        // maintain a registry of all seen devices. This could be useful for lookups or other features.
        this.devices = new Map();
        this.on('iAm', BacnetApi.iAmHandler, this);

        // maintain a registry of all subscriptions and node callbacks, so subscribers can be notified when 
        // we receive an event. 
        this.on('covNotify', BacnetApi.covNotifyHandler, this);
        this.on('covNotifyUnconfirmed', BacnetApi.covNotifyUnconfirmedHandler, this);
        this.on('close', () => this.onDestroy());
    }

    /** 
     * cleal up listeners when connection is destroyed. 
     */
    onDestroy() {
        this.removeAllListeners('iAm');
        this.removeAllListeners('covNotify');
        this.removeAllListeners('covNotifyUnconfirmed');
    }

    covSubscriptionGetEvent(address, subscriptionId) {
        return `COV:${address}:${subscriptionId}`;
    }

    covPropertySubscriptionGetEvent(address, subscriptionId, propertyId) {
        return `COV:${address}:${subscriptionId}:${propertyId}`;
    }

   

    /**
     * Subscribe to all received iAm events.
     * @param {*} callback 
     * @return {address, deviceId, maxApdu, segmentation, vendorId}
     */
    onIAm(callback) {
        this.on('iAm', callback);
    }

    /**
     * Subscribe to all received Who-Is events.
     * @param {*} callback 
     * @return {address, lowLimit, highLimit}
     */
    onWhoIs(callback) {
        this.on('whoIs', callback);
    }

    /**
     * Subscribe to all received Who-Has events.
     * @param {*} callback 
     * @return {address, lowLimit, highLimit, objectId, objectName}
     */
    onWhoHas(callback) {
        this.on('whoHas', callback);
    }

    /**
     * Subscribe to all received CovNotifyUnconfirmed events.
     * @param {*} callback 
     * @return  {address, request}
     */
    onCovNotifyUnconfirmed(callback) {
        this.on('covNotifyUnconfirmed', callback);
    }

    /**
     * Subscrive to all received TimeSync events.
     * @param {*} callback 
     * @return  {address, dateTime}
     */
    onTimeSync(callback) {
        this.on('timeSync', callback);
    }

    /**
     * Subscribe to all received TimeSyncUTC events.
     * @param {*} callback 
     * @return  {address, dateTime}
     */
    onTimeSyncUTC(callback) {
        this.on('timeSyncUTC', callback);
    }

    /**
     * Subscribe to all received on EventNotify events.
     * @param {*} callback 
     * @return  {address, eventData}
     */
    onEventNotify(callback) {
        this.on('eventNotify', callback);
    }

    /**
     * Subscribe to all received IHaveBroadcast events.
     * @param {*} callback 
     * @return  {address, eventData}
     */
    onIHaveBroadcast(callback) {
        this.on('ihaveBroadcast', callback);
    }

    /**
     * Subscrive to all received privateTransfer events.
     * @param {*} callback 
     * @return  {address, eventData}
     */
    onPrivateTransfer(callback) {
        this.on('privateTransfer', callback);
    }

    /**
     * Broadcast a who-is message. Useful for initiating device discovery.
     * @param {number} lowLimit
     * @param {number} highLimit
     * @param {ip address} address
     */
    whoIs(lowLimit, highLimit, address) {
        lowLimit = this.toNumber(lowLimit);
        highLimit = this.toNumber(highLimit);
        super.whoIs({lowLimit, highLimit, address});
        return Promise.resolve();
    }

    /**
     * The readProperty command reads a single property of an object from a device.
     * @function bacstack.readProperty
     * @param {string} address - IP address of the target device.
     * @param {object} objectId - The BACNET object ID to read.
     * @param {number} objectId.type - The BACNET object type to read.
     * @param {number} objectId.instance - The BACNET object instance to read.
     * @param {number} propertyId - The BACNET property id in the specified object to read.
     * @param {object=} options
     * @param {MaxSegments=} options.maxSegments - The maximimal allowed number of segments.
     * @param {MaxAdpu=} options.maxAdpu - The maximal allowed ADPU size.
     * @param {number=} options.invokeId - The invoke ID of the confirmed service telegram.
     * @param {number=} options.arrayIndex - The array index of the property to be read.
     * @return  {Promise} 
     * @example
     * const bacnet = require('bacstack');
     * const client = new bacnet();
     *
     * client.readProperty('192.168.1.43', {type: 8, instance: 44301}, 28, (err, value) => {
     *   console.log('value: ', value);
     * });
     */
    readProperty(address, objectId, propertyId, options) { 
        return new Promise((resolve, reject) => {
            return super.readProperty(address, objectId, propertyId, options, (err, value) => {
                if (err) return reject(err);
                return resolve(value);
            });
        });
    }

    /**
     * The writeProperty command writes a single property of an object to a device.
     * @function bacstack.writeProperty
     * @param {string} address - IP address of the target device.
     * @param {object} objectId - The BACNET object ID to write.
     * @param {number} objectId.type - The BACNET object type to write.
     * @param {number} objectId.instance - The BACNET object instance to write.
     * @param {number} propertyId - The BACNET property id in the specified object to write.
     * @param {object[]} values - A list of values to be written to the specified property.
     * @param {ApplicationTags} values.tag - The data-type of the value to be written.
     * @param {number} values.value - The actual value to be written.
     * @param {object=} options
     * @param {MaxSegments=} options.maxSegments - The maximimal allowed number of segments.
     * @param {MaxAdpu=} options.maxAdpu - The maximal allowed ADPU size.
     * @param {number=} options.invokeId - The invoke ID of the confirmed service telegram.
     * @param {number=} options.arrayIndex - The array index of the property to be read.
     * @param {number=} options.priority - The priority of the value to be written.
     * @return {Promise} 
     * @example
     * const bacnet = require('bacstack');
     * const client = new bacnet();
     *
     * client.writeProperty('192.168.1.43', {type: 8, instance: 44301}, 28, [
     *   {type: bacnet.enum.ApplicationTags.BACNET_APPLICATION_TAG_REAL, value: 100}
     * ], (err, value) => {
     *   console.log('value: ', value);
     * });
     */
    writeProperty(address, objectId, propertyId, values, options) {
        return new Promise((resolve, reject) => {
            return super.writeProperty(address, objectId, propertyId, options, (err, value) => {
                if (err) return reject(err);
                return resolve(value);
            });
        });
    }

    /**
     * The readPropertyMultiple command reads multiple properties in multiple objects from a device.
     * @function bacstack.readPropertyMultiple
     * @param {string} address - IP address of the target device.
     * @param {object[]} requestArray - List of object and property specifications to be read.
     * @param {object} requestArray.objectId - Specifies which object to read.
     * @param {number} requestArray.objectId.type - The BACNET object type to read.
     * @param {number} requestArray.objectId.instance - The BACNET object instance to read.
     * @param {object[]} requestArray.properties - List of properties to be read.
     * @param {number} requestArray.properties.id - The BACNET property id in the specified object to read. Also supports 8 for all properties.
     * @param {object=} options
     * @param {MaxSegments=} options.maxSegments - The maximimal allowed number of segments.
     * @param {MaxAdpu=} options.maxAdpu - The maximal allowed ADPU size.
     * @param {number=} options.invokeId - The invoke ID of the confirmed service telegram.
     * @return {Promise} 
     * @example
     * const bacnet = require('bacstack');
     * const client = new bacnet();
     *
     * const requestArray = [
     *   {objectId: {type: 8, instance: 4194303}, properties: [{id: 8}]}
     * ];
     * client.readPropertyMultiple('192.168.1.43', requestArray).then(
     *   (value) => { console.log('value: ', value); },
     *   (err) => { console.log('err: ', err); 
     * });
     */
    readPropertyMultiple(address, propertiesArray, options) {
        return new Promise((resolve, reject) => {
            return super.readPropertyMultiple(address, propertiesArray, options, (err, value) => {
                if (err) return reject(err);
                return resolve(value);
            });
        });
    }

    /**
     * The writePropertyMultiple command writes multiple properties in multiple objects to a device.
     * @function bacstack.writePropertyMultiple
     * @param {string} address - IP address of the target device.
     * @param {object[]} values - List of object and property specifications to be written.
     * @param {object} values.objectId - Specifies which object to read.
     * @param {number} values.objectId.type - The BACNET object type to read.
     * @param {number} values.objectId.instance - The BACNET object instance to read.
     * @param {object[]} values.values - List of properties to be written.
     * @param {object} values.values.property - Property specifications to be written.
     * @param {number} values.values.property.id - The BACNET property id in the specified object to write.
     * @param {number} values.values.property.index - The array index of the property to be written.
     * @param {object[]} values.values.value - A list of values to be written to the specified property.
     * @param {ApplicationTags} values.values.value.tag - The data-type of the value to be written.
     * @param {object} values.values.value.value - The actual value to be written.
     * @param {number} values.values.priority - The priority to be used for writing to the property.
     * @param {object=} options
     * @param {MaxSegments=} options.maxSegments - The maximimal allowed number of segments.
     * @param {MaxAdpu=} options.maxAdpu - The maximal allowed ADPU size.
     * @param {number=} options.invokeId - The invoke ID of the confirmed service telegram.
     * @return {Promise} 
     * @example
     * const bacnet = require('bacstack');
     * const client = new bacnet();
     *
     * const values = [
     *   {objectId: {type: 8, instance: 44301}, values: [
     *     {property: {id: 28, index: 12}, value: [{type: bacnet.enum.ApplicationTags.BACNET_APPLICATION_TAG_BOOLEAN, value: true}], priority: 8}
     *   ]}
     * ];
     * client.writePropertyMultiple('192.168.1.43', values).then(
     *  (value) => {console.log('value: ', value); },
     *  (err) => { console.log('err', value); }
     * );
     */
    writePropertyMultiple(address, values, options) {
        return new Promise((resolve, reject) => {
            return super.writePropertyMultiple(address, values, options, (err, value) => {
                if (err) return reject(err);
                return resolve(value);
            });
        });
    }

   /**
    * Subscribe to all change of value notices for a device.
    * @param {string} objectId
    * @param {string} subscribeId
    * @param {bool} issueConfirmedNotifications
    * @param {number} lifetime
    * @param {object=} options
    * @param {listener} callback for events
    * @return {Promise}
    */
    subscribeCOV(address, objectId, subscribeId, issueConfirmedNotifications, lifetime, options, listener) {
        return new Promise((resolve, reject) => {
            // send cancel == false to subscribe.. use unsubscribe to send cancel ==true
            super.subscribeCOV(address, objectId, subscribeId, false, issueConfirmedNotifications, lifetime, options, (err, value) => {
                if (err) { return reject(err); }
                let event = this.covSubscriptionGetEvent(address, subscribeId);
                //this.on(event, listener);
                return resolve(value);
            });
        })
    }

    /** 
     */
    unsubscribeCOV(address, objectId, subscribeId, listener) {
        return new Promise((resolve, reject) => {
            let event = this.covSubscriptionGetEvent(address, subscribeId);
            let listeners = this.listeners(event);
            if (!listeners || !!listeners.length) { return reject('Not subscribed'); }            
            super.subscribeCOV(address, objectId, subscribeId, true, null, null, (err, value) => {
                if (err) { return reject(err); }
                //this.off(event, listener)
                return resolve(value);
            });
        })
    }

   /**
    * subscribe to change of a specific object property.
    * @param {string} objectId
    * @param {string} subscribeId
    * @param {bool} issueConfirmedNotifications
    * @param {number} lifetime
    * @param {object=} options
    * @return {Promise}
    */
    subscribeProperty(address, objectId, monitoredProperty, subscribeId, issueConfirmedNotifications, options, listener) {
        return new Promise((resolve, reject) => {
            super.subscribeProperty(address, objectId, monitoredProperty, subscribeId, false, issueConfirmedNotifications, options, (err, value) => {
                if (err) { return reject(err); }
                let event = this.covPropertySubscriptionGetEvent(address, subscribeId, monitoredProperty);
                //this.on(event, listener);
                return resolve(value);
            });
        });
    }

    unsubscribeProperty(address, subscribeId, objectId, propertyId, listener) {
        return new Promise((resolve, reject) => {
            let event = this.covPropertySubscriptionGetEvent(address, subscribeId);
            let listeners = this.listeners(event);
            if (!listeners || !!listeners.length) { return reject('Not subscribed'); }   
            this.client.subscribeProperty(address, objectId, propertyId, subscribeId, true, null, (err, value) => {
                if (err) { return reject(err); }
                //this.off(event, listener)
                return resolve(value);
            });
        });
    }
    
    toNumber(value) {
        return isNaN(parseInt(value)) ? undefined : +value;
    }
}

module.exports = BacnetApi;
