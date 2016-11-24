import Runner from './../../runner';
import dropMoment from './../../common/dropMoment';
import times from './../../common/times';
import { DONE_STORY_STATUS } from './../../common/constants';
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
