import Runner from './../../runner';
import dropMoment from './../../common/dropMoment';
import times from './../../common/times';
import throttler from './../../common/throttler';
import {
    getDaagScope,
    createDoneStory,
    createChangeSet,
    createBundle
} from './utils';

const SCOPE_NAME = 'ValveScope';


module.exports = class ValveRunner extends Runner {
    async command() {
        const v1 = this.authenticateAs('admin', 'admin');

        const { scopeOid, developmentPhase, testingPhase, productionPhase } = await getDaagScope(v1, SCOPE_NAME);

        const doneStories = await Promise.all(times(5).map(i => createDoneStory(v1, scopeOid)));
        const doneChangeSets = await Promise.all(
            doneStories.map(story => createChangeSet(v1, [dropMoment(story.id)]))
        ).then(changeSets => changeSets.map(changeSet => dropMoment(changeSet.id)));

        /*--------------------------------------------------------------------------------------------*/
        /*----------------------------------- FULLY MATURED BUNDLE -----------------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        console.log('FULLY MATURED BUNDLE');

        const MATURED_BUNDLE_PACKAGE = 'Matured Bundle Package';

        const promises = [
            ()  => createBundle(v1, developmentPhase, MATURED_BUNDLE_PACKAGE, doneChangeSets),
            () => createBundle(v1, testingPhase, MATURED_BUNDLE_PACKAGE, doneChangeSets),
            () => createBundle(v1, productionPhase, MATURED_BUNDLE_PACKAGE, doneChangeSets)
        ];
        return throttler(promises, 3);
    }
};
