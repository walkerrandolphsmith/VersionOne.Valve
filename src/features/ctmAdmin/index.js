import Runner from './../../runner';
import {
    getLifecycleAccessToken,
    configureLifecyclePluginInContinuum,
    getContinuumAccessToken,
    configureContinuumInLifecycle,
} from './utils';


module.exports = class ValveRunner extends Runner {
    async command() {
        const CTM = {
            URL : 'http://continuumstaging.eastus.cloudapp.azure.com:8080',
            USERNAME : 'general',
            PASSWORD : 'password'
        };

        const LC = {
            URL : 'https://www14.v1host.com:443/v1sdktesting/',
            USERNAME : 'admin',
            PASSWORD : 'admin'
        };

        const lifecycleAccessToken = await getLifecycleAccessToken(LC.URL, LC.USERNAME, LC.PASSWORD);
        await configureLifecyclePluginInContinuum(CTM.URL, CTM.USERNAME, CTM.PASSWORD, LC.URL, lifecycleAccessToken);
        const continuumAccessToken = await getContinuumAccessToken(CTM.URL, CTM.USERNAME, CTM.PASSWORD);
        await configureContinuumInLifecycle(LC.URL, LC.USERNAME, LC.PASSWORD, CTM.URL, continuumAccessToken);

        return Promise.resolve();
    }
};