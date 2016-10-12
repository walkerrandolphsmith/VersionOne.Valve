import Runner from './../../runner';
import dropMoment from './../../common/dropMoment';
import times from './../../common/times';
import { DONE_STORY_STATUS, OID_NULL } from './../../common/constants';
import {
    getScope,
    getPhase,
    getEpicCategories,
    createStory,
    createChangeSet
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
        /*---------------------------------- Create tons of epics ------------------------------------*/
        /*--------------------------------------------------------------------------------------------*/


        let loeEpics = [];
        while (loeEpics.length < 1000) {
            console.log('created ', loeEpics.length, ' epics');
            loeEpics = loeEpics.concat(await Promise.all(
                times(20).map(i => v1.create('Epic', {
                    Name: 'ValveEpic LoadEpic ' + i,
                    Category: epicCategory,
                    Scope: scopeOid
                })))
            );
        }

        console.log('creating stories on epics');

        while (loeEpics.length > 0) {
            console.log("epics remaining: ", loeEpics.length);
            await Promise.all(loeEpics.slice(0, 2).map(async(epic) => {
                const loeStories = await Promise.all(times(10).map(i => createStory(v1, scopeOid)));
                const loeChangeSets = await Promise.all(
                    loeStories.map(story => createChangeSet(v1, [dropMoment(story.id)]))
                ).then(changeSets => changeSets.map(changeSet => dropMoment(changeSet.id)));

                return Promise.all(
                    loeStories.map(story => v1.update(dropMoment(story.id), {
                        Super: dropMoment(epic.id)
                    }))
                )
            }));

            loeEpics.splice(0, 2);
        }

        return Promise.resolve();
    }
};