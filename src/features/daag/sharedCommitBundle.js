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

        return Promise.resolve();
    }
};
