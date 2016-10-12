import Runner from './../../runner';
import dropMoment from './../../common/dropMoment';
import { DONE_STORY_STATUS, OID_NULL } from './../../common/constants';
import {
    getPhase,
    getEpicCategories,
    createStoriesForScope
} from './utils';

module.exports = class Daag extends Runner {
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

        const subSetOfSchemeValues = [
            developmentPhase, testingPhase, productionPhase,
            epicCategory, featureCategory,
            DONE_STORY_STATUS
        ];

        /*--------------------------------------------------------------------------------------------*/
        /*----- Two Scopes with Different Workspaces with Different Epic Categories-------------------*/
        /*----- Second Scope inherits its Workspace --------------------------------------------------*/

        const schemeOid = await v1.create('Scheme', {
            Name: 'ValveScheme',
            SelectedValues: schemeValues
        }).then(scheme => dropMoment(scheme.id));

        const schemeWithOutAllEpicTypesOid = await v1.create('Scheme', {
            Name: 'ValveScheme',
            SelectedValues: subSetOfSchemeValues
        }).then(scheme => dropMoment(scheme.id));

        const scopeGrandParentOid = await v1.create('Scope', {
            Name: 'Valve Grand Parent Scope',
            Parent: 'Scope:0',
            Scheme: schemeOid,
            BeginDate: '2016-06-28'
        }).then(scope => dropMoment(scope.id));

        const scopeParentOid = await v1.create('Scope', {
            Name: 'Valve Parent Scope',
            Parent: scopeGrandParentOid,
            Scheme: schemeOid,
            BeginDate: '2016-06-28'
        }).then(scope => dropMoment(scope.id));

        const scopeGrandChildOid = await v1.create('Scope', {
            Name: 'Valve Grand Child Scope',
            Parent: scopeParentOid,
            BeginDate: '2016-06-28'
        }).then(scope => dropMoment(scope.id));

        const scopeSiblingOid = await v1.create('Scope', {
            Name: 'Valve Sibling Scope With Subset of Epic Categories',
            Parent: scopeGrandParentOid,
            Scheme: schemeWithOutAllEpicTypesOid,
            BeginDate: '2016-06-28'
        }).then(scope => dropMoment(scope.id));

        createStoriesForScope(v1, scopeParentOid, epicCategory, OID_NULL);
        createStoriesForScope(v1, scopeParentOid, epicCategory, developmentPhase);

        createStoriesForScope(v1, scopeGrandChildOid, epicCategory, OID_NULL);
        createStoriesForScope(v1, scopeGrandChildOid, epicCategory, developmentPhase);
        createStoriesForScope(v1, scopeGrandChildOid, epicCategory, testingPhase);
        createStoriesForScope(v1, scopeGrandChildOid, initiativeCategory, OID_NULL);
        createStoriesForScope(v1, scopeGrandChildOid, initiativeCategory, developmentPhase);
        createStoriesForScope(v1, scopeGrandChildOid, initiativeCategory, testingPhase);

        createStoriesForScope(v1, scopeSiblingOid, epicCategory, OID_NULL);
        createStoriesForScope(v1, scopeSiblingOid, epicCategory, productionPhase);


        return Promise.resolve();
    }
};