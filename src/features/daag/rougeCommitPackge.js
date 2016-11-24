import Runner from './../../runner';
import dropMoment from './../../common/dropMoment';
import times from './../../common/times';
import {
    getDaagScope,
    createDoneStory,
    createBundle
} from './utils';

const SCOPE_NAME = 'ValveScope';


module.exports = class ValveRunner extends Runner {
    async command() {
        const v1 = this.authenticateAs('admin', 'admin');

        const scopeOid = await getDaagScope(v1, SCOPE_NAME);

        /*--------------------------------------------------------------------------------------------*/
        /*------------------------------------ ROUGE PACKAGE -----------------------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        console.log('ROUGE PACKAGE');

        const ROUGE_PACKAGE = 'Rouge Package';

        const rougeStories = await Promise.all(times(10).map(i => createDoneStory(v1, scopeOid)));
        const rougeChangeSets = await Promise.all(
            rougeStories.map(story => v1.create('ChangeSet', {Name: 'ChangeSet'}))
        ).then(changeSets => changeSets.map(changeSet => dropMoment(changeSet.id)));


        const onGoingStories = await Promise.all(times(10).map(i => createDoneStory(v1, scopeOid)));
        const onGoingChangeSets = await Promise.all(
            onGoingStories.map(story => v1.create('ChangeSet', {Name: 'ChangeSet'}))
        ).then(changeSets => changeSets.map(changeSet => dropMoment(changeSet.id)));

        await createBundle(v1, developmentPhase, ROUGE_PACKAGE, [
            rougeChangeSets[0], rougeChangeSets[1], rougeChangeSets[3], onGoingChangeSets[0]
        ]);

        await createBundle(v1, testingPhase, ROUGE_PACKAGE, [
            rougeChangeSets[0], rougeChangeSets[1], rougeChangeSets[3], onGoingChangeSets[0], onGoingChangeSets[1]
        ]);

        await createBundle(v1, productionPhase, ROUGE_PACKAGE, [
            rougeChangeSets[3], rougeChangeSets[4], onGoingChangeSets[3]
        ]);

        return Promise.resolve();
    }
};
