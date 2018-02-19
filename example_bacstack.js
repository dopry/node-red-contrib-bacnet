const bacstack = require("bacstack");
const client = new bacstack({});

client.on('iAm', (device) => {
  console.log('iAm', JSON.stringify(device));
});

client.on('covNotify', (data) => {
  console.log('covNotify', JSON.stringify(data));
});

client.on('covNotifyUnconfirmed', (data) => {
  console.log('covNotifyUnconfirmed', JSON.stringify(data));
});

client.whoIs();

// Read Device Object
const requestArray = [{
  objectId: {type: 8, instance: 2434742 },
  properties: [{id: 8}]
}];
/*
client.readPropertyMultiple('10.159.72.159', requestArray, (err, value) => {
  console.log('10.159.72.159, (8, 2434742): ', JSON.stringify(value, null, 4));
});
*/

/**
LtLvlSpt, analog-value, 1 (spots lighting value)
Occp_Man, binary-value, 1 (occupied)
RmTmp_ClgSpt, analog-value, 2 (Room Temperature, Cooling Set Point)
*/


/*
covNotifyUnconfirmed {
    "address": "10.159.72.159",
    "request": {
        "len": 32,
        "subscriberProcessId": 1,
        "initiatingDeviceId": { "type": 8, "instance": 2434742 },
        "monitoredObjectId": { "type": 2, "instance": 1 },
        "timeRemaining": 50000,
        "values": [
            {
                "property": { "id": 85, "index": 4294967295 },
                "value": [
                    { "type": 4, "value": 70 }
                ],
                "priority": 0
            },
            {
                "property": { "id": 111, "index": 4294967295 },
                "value": [
                    { "type": 8, "value": { "value": [0], "bitsUsed": 4  }}
                ],
                "priority": 0
            }
        ]
    }
}
*/

let LtLvlSpt  = { type: bacstack.enum.ObjectTypes.OBJECT_ANALOG_VALUE, instance: 1};
let Occp_Man = { type: bacstack.enum.ObjectTypes.OBJECT_BINARY_VALUE, instance: 1};
let RmTmp_ClgSpt = { type: bacstack.enum.ObjectTypes.OBJECT_ANALOG_VALUE, instance: 2};

/*
client.subscribeCOV('10.159.72.159', LtLvlSpt, 1, false, false, 50000, {}, (err, value) => {
    console.log('subscribeCOV', JSON.stringify(err), JSON.stringify(value));
    let propertyId = bacstack.enum.PropertyIds.PROP_PRESENT_VALUE; //i 85;
    let values = [ {type:  bacstack.enum.BACNET_APPLICATION_TAG_REAL, value: 60} ];
    let options = { priority: 10 }
    client.writeProperty('10.159.72.159', LtLvlSpt, propertyId, values, options, (err, value) => {
      console.log('Set LtLvlSpt 60', JSON.stringify(err), JSON.stringify(value));
      values[0].value = 70;
      setTimeout(() => {
        client.writeProperty('10.159.72.159', LtLvlSpt, propertyId, values, options, (err, value) => {
          console.log('Reset LtLvlSpt 70', err, JSON.stringify(value));
        });
      }, 15000);
    });
});
*/


client.subscribeCOV('10.159.72.159', Occp_Man, 2, false, false, 50000, {}, (err, value) => {
    console.log('subscribeCOV', JSON.stringify(err), JSON.stringify(value));
    let propertyId = bacstack.enum.PropertyIds.PROP_PRESENT_VALUE; //i 85;
    let values = [ {type:  bacstack.enum.ApplicationTags.BACNET_APPLICATION_TAG_ENUMERATED, value: true} ];
    let options = { priority: 10 }
    client.writeProperty('10.159.72.159', Occp_Man, propertyId, values, options, (err, value) => {
      console.log('Set Occp_Man true', JSON.stringify(err), JSON.stringify(value));
      values[0].value = false;
      setTimeout(() => {
        client.writeProperty('10.159.72.159', Occp_Man, propertyId, values, options, (err, value) => {
          console.log('Reset Occp_Man false', err, JSON.stringify(value));
        });
      }, 15000);
    });
});
