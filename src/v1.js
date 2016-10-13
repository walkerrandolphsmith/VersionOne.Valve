const axios = require('axios');
const btoa = require('btoa');
const v1sdk = require('v1sdk/dist/index');
const sdk = v1sdk.default;
const axiosConnector = v1sdk.axiosConnector;
const { v1Protocol, v1Port, v1Host, v1Instance } = require('./config');

module.exports = function() {
    const isHttps = v1Protocol === 'https';
    const url = `${v1Protocol}://${v1Host}:${v1Port}/${v1Instance}/`;

    const axiosConnectedSdk = axiosConnector(axios)(sdk);
    const unauthenticatedV1 = axiosConnectedSdk(v1Host, v1Instance, v1Port, isHttps);

    const authenticate = (username, password) => {
        const v1 = unauthenticatedV1.withCreds(username, password);

        const token = btoa(`${username}:${password}`);
        const instance = axios.create({
            baseURL: url,
            timeout: 1000,
            headers:  {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Basic ${token}`
            }
        });


        const activityStream = (oid) => v1.getActivityStream(oid).then(r => r.data);
        const query = (body) => v1.query(body).then(r => r.data);
        const create = (assetType, assetData) => v1.create(assetType, assetData).then(r => r.data);
        const update = (oidToken, assetData) => v1.update(oidToken, assetData).then(r => r.data);
        const executeOperation = (oidToken, operationName) => v1.executeOperation(oidToken, operationName).then(r => r.data);
        const setMemberRoles = (relativeUrl, payload) => instance.post(url + relativeUrl, payload).then(res => res.data);
        return {
            activityStream,
            query,
            create,
            update,
            executeOperation,
            setMemberRoles
        }
    };

    return {
        authenticate,
        url
    }
};


