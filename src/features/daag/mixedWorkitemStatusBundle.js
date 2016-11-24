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

        const scopeOid = await getDaagScope(v1, SCOPE_NAME);

        const doneStories = await Promise.all(times(5).map(i => createDoneStory(v1, scopeOid)));
        const doneChangeSets = await Promise.all(
            doneStories.map(story => createChangeSet(v1, [dropMoment(story.id)]))
        ).then(changeSets => changeSets.map(changeSet => dropMoment(changeSet.id)));

        const onGoingStories = await Promise.all(times(5).map(i => createStory(v1, scopeOid)));
        const onGoingChangeSets = await Promise.all(
            onGoingStories.map(story => createChangeSet(v1, [dropMoment(story.id)]))
        ).then(changeSets => changeSets.map(changeSet => dropMoment(changeSet.id)));

        /*--------------------------------------------------------------------------------------------*/
        /*--------------------------- MIXED WORKITEM STATUS BUNDLE -----------------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        console.log('MIXED WORKITEM STATUS BUNDLE');

        const MIXED_WI_STATUS_PACKAGE = 'Matured Bundle Package';

        await createBundle(v1, developmentPhase, MIXED_WI_STATUS_PACKAGE, [
            ...doneChangeSets, ...onGoingChangeSets
        ]);
        return Promise.resolve();
    }
};
