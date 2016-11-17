import Runner from './../../runner';
import dropMoment from './../../common/dropMoment';
import times from './../../common/times';
import { DONE_STORY_STATUS, OID_NULL } from './../../common/constants';
import {
    getScope,
    getPhase,
    getEpicCategories,
    createStory,
    createDoneStory,
    createChangeSet,
    createBundle
} from './utils';

const SCOPE_NAME = 'ValveScope';


module.exports = class ValveRunner extends Runner {
    async command() {
        const v1 = this.authenticateAs('admin', 'admin');

        const developmentPhase = await getPhase(v1, 'Development');
        const testingPhase = await getPhase(v1, 'Testing');
        const productionPhase = await getPhase(v1, 'Production');

        const epicCategory = await getEpicCategories(v1, 'Epic');
        const featureCategory = await getEpicCategories(v1, 'Feature');
        const subFeatureCategory = await getEpicCategories(v1, 'SubFeature');
        const initiativeCategory = await getEpicCategories(v1, 'Initiative');

        const schemeValues = [
            developmentPhase, testingPhase, productionPhase,
            epicCategory, featureCategory, subFeatureCategory, initiativeCategory,
            DONE_STORY_STATUS
        ];

        const schemeOid = await v1.create('Scheme', {
            Name: 'ValveScheme',
            SelectedValues: schemeValues
        }).then(scheme => dropMoment(scheme.id));

        const scopeOid = await getScope(v1, SCOPE_NAME, schemeOid);

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
