module.exports = function (RED) {
    function getBacnetLookups() {
        const bacstack = require('bacstack');

        /**
         * convert a bacstack enum to a nodered ui autocomplete lookup.
         */
        function toLookup(collection) {
            return Object.keys(collection).map((key) => {
                return { value: collection[key], label: key } 
            });
        }
    
        // create enum lookups.
        const applicationTags = toLookup(bacstack.enum.ApplicationTags);
        const propertyIds = toLookup(bacstack.enum.PropertyIds);
        const objectTypes = toLookup(bacstack.enum.ObjectTypes);
    
        return { applicationTags, propertyIds, objectTypes };
    }

    const lookups = getBacnetLookups();

    // serve autocomplete lookups to the UI. 
    RED.httpAdmin.get('/bacnet/ApplicationTags', function (req, res) {
        res.json(lookups.applicationTags);
    });

    RED.httpAdmin.get('/bacnet/PropertyIds', function (req, res) {
        res.json(lookups.propertyIds);
    });

    RED.httpAdmin.get('/bacnet/ObjectTypes', function (req, res) {
        res.json(lookups.objectTypes);
    });
};
