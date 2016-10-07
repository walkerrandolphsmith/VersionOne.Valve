const axios = require('axios');
const v1sdk = require('v1sdk/dist/index');
const sdk = v1sdk.default;
const axiosConnector = v1sdk.axiosConnector;
const { v1Protocol, v1Port, v1Host, v1Instance } = require('./config');

module.exports = function() {
    const url = `${v1Protocol}://${v1Port}:${v1Host}/${v1Instance}/`;

    const axiosConnectedSdk = axiosConnector(axios)(sdk);
    const unauthenticatedV1 = (username, password) => axiosConnectedSdk(V1_HOST, V1_INSTANCE, V1_PORT, V1_PROTOCOL);

    const authenticate = (username, password) => {
        const v1 = unauthenticatedV1.withCredentials(username, password);


        const activityStream = (oid) => v1.getActivityStream(oid).then(r => r.data);
        const queryv1 = (body) => v1.query(body).then(r => r.data);
        const create = (assetType, assetData) => v1.create(assetType, assetData).then(r => r.data);
        const update = (oidToken, assetData) => v1.update(oidToken, assetData).then(r => r.data);
        const executeOperation = (oidToken, operationName) => v1.executeOperation(oidToken, operationName).then(r => r.data);
        return {
            activityStream,
            queryv1,
            create,
            update,
            executeOperation
        }
    };

    return {
        authenticate,
        url
    }
};


