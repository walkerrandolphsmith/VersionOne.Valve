import Glance from 'glance-webdriver';

export const configureLifecyclePluginInContinuum = async (ctm_url, ctm_username, ctm_password, lc_url, lc_apitoken) => {
    const glance = new Glance({
        driverConfig: {desiredCapabilities: {browserName: 'chrome'}}
    });

    const VERSIONONE_INSTANCE_NAME = 'V1 Setup by Automation';

    return glance
        .url(ctm_url)
        .set('username ^ input', ctm_username)
        .set('password ^ input', ctm_password)
        .click('attempt_login_btn')
        .click('app_header_icons')
        .click('Administration')
        .click('Manage Plugins')
        .scroll('VersionOne ^ span')
        .click('VersionOne ^ span')
        .set('Instances > Name', VERSIONONE_INSTANCE_NAME)
        .set('Instances > API Token > input',lc_apitoken)
        .set('Instances > URL', lc_url)
        .click('vertical ^ dl > Instance 1')
        .end();
};

export const getLifecycleAccessToken = async (lc_url, lc_username, lc_password) => new Promise((resolve, reject) => {
    const glance = new Glance({
        driverConfig: {desiredCapabilities: {browserName: 'chrome'}}
    });

    const CTM_NAME = 'Claires Local';

    return glance
        .url(lc_url)
        .set('username ^ input', lc_username)
        .set('password ^ input', lc_password)
        .click('Login')
        .click('member-button > avatar')
        .click('Applications')
        .click('Step 1 > Personal > radio')
        .set('Step 2 > Application Name > input', CTM_NAME)
        .click('Add')
        .get('Here is your Access Token... > input').then(result => resolve(result))
        .click('Here is your Access Token... > Confirm')
        .end();
});

export const configureContinuumInLifecycle = async (lc_url, lc_username, lc_password, ctm_url, ctm_token) => {
    const glance = new Glance({
        driverConfig: {desiredCapabilities: {browserName: 'chrome'}}
    });

    return glance
        .url(lc_url)
        .set('Username ^ input', lc_username)
        .set('Password ^ input', lc_password)
        .click('login')
        .moveMouseTo('utility-bar > admin-button')
        .click('MainMenu_Admin > DevOps')
        .click('item > Continuum')
        .set('Continuum Instance URL ^ input', ctm_url)
        .set('Continuum API Access Token ^ input', ctm_token)
        .click('Save')
        // .click('Error > OK')
        .click('Success > OK')
        .end();
};

export const getContinuumAccessToken = async (ctm_url, ctm_username, ctm_password) => new Promise(resolve => {
    var glance = new Glance({
        driverConfig: {desiredCapabilities: {browserName: 'chrome'}}
    });

    return glance
        .url(ctm_url)
        .set('username ^ input', ctm_username)
        .set('password ^ input', ctm_password)
        .click('Login')
        .click('menu-icon')
        .click('My Account')
        .get('api_token').then(result => resolve(result))
        .end();
});