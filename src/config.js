require('dotenv').config();

const { V1Protocol, V1Port, V1Host, V1Instance } = process.env;

module.exports = {
    v1Protocol: V1Protocol || 'http',
    v1Port: V1Port || '80',
    v1Host: V1Host || 'localhost',
    v1Instance: V1Instance || 'VersionOne.Web'
};