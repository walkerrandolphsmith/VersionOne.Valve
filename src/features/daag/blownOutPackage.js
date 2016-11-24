import Runner from './../../runner';
import dropMoment from './../../common/dropMoment';
import times from './../../common/times';
import {
    getDaagScope,
    createStory,
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

        const manyStories = await Promise.all(times(20).map(i => createStory(v1, scopeOid)));
        const manyChangeSets = await Promise.all(
            manyStories.map(story => createChangeSet(v1, [dropMoment(story.id)]))
        ).then(changeSets => changeSets.map(changeSet => dropMoment(changeSet.id)));

        /*--------------------------------------------------------------------------------------------*/
        /*--------------------------- TWO ROWS WITH BLOWN OUT PACKAGE --------------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        console.log('FULLY MATURED BUNDLE');

        const MATURED_BUNDLE_PACKAGE = 'Matured Bundle Package';

        await createBundle(v1, developmentPhase, MATURED_BUNDLE_PACKAGE, manyChangeSets);

        await createBundle(v1, testingPhase, MATURED_BUNDLE_PACKAGE, doneChangeSets);

        await createBundle(v1, productionPhase, MATURED_BUNDLE_PACKAGE, doneChangeSets);

        await createBundle(v1, developmentPhase, MATURED_BUNDLE_PACKAGE, doneChangeSets);

        await createBundle(v1, testingPhase, MATURED_BUNDLE_PACKAGE, doneChangeSets);

        await createBundle(v1, productionPhase, MATURED_BUNDLE_PACKAGE, doneChangeSets);

        return Promise.resolve();
    }
};
