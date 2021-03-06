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

        const { 
            scopeOid, developmentPhase, testingPhase, productionPhase,
            epicCategory, featureCategory, subFeatureCategory, initiativeCategory
        } = await getDaagScope(v1, SCOPE_NAME);

        const doneStories = await Promise.all(times(10).map(i => createDoneStory(v1, scopeOid)));
        const doneChangeSets = await Promise.all(
            doneStories.map(story => createChangeSet(v1, [dropMoment(story.id)]))
        ).then(changeSets => changeSets.map(changeSet => dropMoment(changeSet.id)));

        const onGoingStories = await Promise.all(times(10).map(i => createStory(v1, scopeOid)));
        const onGoingChangeSets = await Promise.all(
            onGoingStories.map(story => createChangeSet(v1, [dropMoment(story.id)]))
        ).then(changeSets => changeSets.map(changeSet => dropMoment(changeSet.id)));

        /*--------------------------------------------------------------------------------------------*/
        /*---------------------------------- ASSOICATE WORKITEMS TO EPICS ----------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        console.log('ASSOICATE WORKITEMS TO EPICS');

        const epicTypeEpic = await v1.create('Epic', {
            Name: 'ValveEpic Epic',
            Category: epicCategory,
            Scope: scopeOid
        });

        const epicTypeFeature = await v1.create('Epic', {
            Name: 'ValveEpic Feature',
            Category: featureCategory,
            Scope: scopeOid
        });

        await Promise.all(
            onGoingStories.slice(0, 5).map(story => v1.update(dropMoment(story.id), {
                Super: dropMoment(epicTypeEpic.id)
            }))
        );

        await Promise.all(
            onGoingStories.slice(5, 9).map(story => v1.update(dropMoment(story.id), {
                Super: dropMoment(epicTypeFeature.id)
            }))
        );

        const epicTypeSubFeature = await v1.create('Epic', {
            Name: 'ValveEpic SubFeature',
            Category: subFeatureCategory,
            Scope: scopeOid
        });

        const epicTypeIniative = await v1.create('Epic', {
            Name: 'ValveEpic Initiative',
            Category: initiativeCategory,
            Scope: scopeOid
        });

        await Promise.all(
            doneStories.slice(0, 5).map(story => v1.update(dropMoment(story.id), {
                Super: dropMoment(epicTypeSubFeature.id)
            }))
        );

        await Promise.all(
            doneStories.slice(5, 9).map(story => v1.update(dropMoment(story.id), {
                Super: dropMoment(epicTypeIniative.id)
            }))
        );

        /*--------------------------------------------------------------------------------------------*/
        /*----------------------------------- FULLY MATURED BUNDLE -----------------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        console.log('FULLY MATURED BUNDLE');

        const MATURED_BUNDLE_PACKAGE = 'Matured Bundle Package';

        await createBundle(v1, developmentPhase, MATURED_BUNDLE_PACKAGE, [
            doneChangeSets[0], doneChangeSets[1], doneChangeSets[2], doneChangeSets[3]
        ]);

        await createBundle(v1, testingPhase, MATURED_BUNDLE_PACKAGE, [
            doneChangeSets[0], doneChangeSets[1], doneChangeSets[2], doneChangeSets[3]
        ]);

        await createBundle(v1, productionPhase, MATURED_BUNDLE_PACKAGE, [
            doneChangeSets[0], doneChangeSets[1], doneChangeSets[2], doneChangeSets[3]
        ]);

        /*--------------------------------------------------------------------------------------------*/
        /*--------------------------- MIXED WORKITEM STATUS BUNDLE -----------------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        console.log('MIXED WORKITEM STATUS BUNDLE');

        const MIXED_WI_STATUS_PACKAGE = 'Matured Bundle Package';

        await createBundle(v1, developmentPhase, MIXED_WI_STATUS_PACKAGE, [
            ...doneChangeSets, onGoingChangeSets[0], onGoingChangeSets[1]
        ]);


        /*--------------------------------------------------------------------------------------------*/
        /*------------------------------------ ROUGE PACKAGE -----------------------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        console.log('ROUGE PACKAGE');

        const ROUGE_PACKAGE = 'Rouge Package';

        const rougeStories = await Promise.all(times(10).map(i => createDoneStory(v1, scopeOid)));
        const rougeChangeSets = await Promise.all(
            rougeStories.map(story => v1.create('ChangeSet', {Name: 'ChangeSet'}))
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

        /*--------------------------------------------------------------------------------------------*/
        /*----------------------------------- SHARED COMMIT BUNDLE -----------------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        console.log('SHARED COMMIT BUNDLE');

        const SHARED_COMMIT_PACKAGE = 'Shared Commit Package';

        const sharedWorkitems = await Promise.all(
            times(3).map(i => createStory(v1, scopeOid))
        ).then(workitems => workitems.map(workitem => dropMoment(workitem.id)));
        const sharedChangeSet = await createChangeSet(v1, sharedWorkitems)
            .then(changeSet => dropMoment(changeSet.id));

        await createBundle(v1, developmentPhase, SHARED_COMMIT_PACKAGE, [
            sharedChangeSet
        ]);

        /*--------------------------------------------------------------------------------------------*/
        /*----------------------------------- SPREAD WORKITEM BUNDLE ---------------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        console.log('SPREAD WORKITEM BUNDLE');

        const SPREAD__PACKAGE = 'Spread workitem in package';

        const spreadWorkitem = await createStory(v1, scopeOid);
        const spreadChangeSets = await Promise.all(
            times(6).map(i => createChangeSet(v1, [dropMoment(spreadWorkitem.id)]))
        ).then(changeSets => changeSets.map(changeSet => dropMoment(changeSet.id)));

        await createBundle(v1, developmentPhase, SPREAD__PACKAGE, [
            spreadChangeSets[0], spreadChangeSets[1]
        ]);

        await createBundle(v1, testingPhase, SPREAD__PACKAGE, [
            spreadChangeSets[2], spreadChangeSets[3]
        ]);

        await createBundle(v1, productionPhase, SPREAD__PACKAGE, [
            spreadChangeSets[4], spreadChangeSets[5]
        ]);

        return Promise.resolve();
    }
};