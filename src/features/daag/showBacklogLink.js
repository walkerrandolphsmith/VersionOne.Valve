import Runner from './../../runner';
import dropMoment from './../../common/dropMoment';
import times from './../../common/times';
import throttler from './../../common/throttler';
import { DONE_STORY_STATUS } from './../../common/constants';
import { getScope, getPhase, getEpicCategories, createStory } from './utils';

const SCOPE_NAME = 'Show Backlog Link';

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
        /*------------------------------- Show Backlog Link ------------------------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        
        const promises = times(151).map(() => () => createStory(v1, scopeOid));
        const stories = await throttler(promises, 25);

        return Promise.resolve(stories);
    }
};
