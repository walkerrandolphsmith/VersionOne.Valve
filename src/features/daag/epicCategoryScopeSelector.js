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
        /*--------------------------------------------------------------------------------------------*/

        const schemeOid = await v1.create('Scheme', {
            Name: 'ValveScheme',
            SelectedValues: schemeValues
        }).then(scheme => dropMoment(scheme.id));

        const schemeWithOutAllEpicTypesOid = await v1.create('Scheme', {
            Name: 'ValveScheme',
            SelectedValues: subSetOfSchemeValues
        }).then(scheme => dropMoment(scheme.id));

        const scopeParentOid = await v1.create('Scope', {
            Name: 'Valve Parent Scope',
            Parent: 'Scope:0',
            Scheme: schemeOid,
            BeginDate: '2016-06-28'
        }).then(scope => dropMoment(scope.id));

        const scopeSibling1Oid = await v1.create('Scope', {
            Name: 'Valve Sibling Scope',
            Parent: scopeParentOid,
            Scheme: schemeOid,
            BeginDate: '2016-06-28'
        }).then(scope => dropMoment(scope.id));

        const scopeSibling2Oid = await v1.create('Scope', {
            Name: 'Valve Sibling Scope With Subset of Epic Categories',
            Parent: scopeParentOid,
            Scheme: schemeWithOutAllEpicTypesOid,
            BeginDate: '2016-06-28'
        }).then(scope => dropMoment(scope.id));

        createStoriesForScope(v1, scopeSibling1Oid, epicCategory, OID_NULL);
        createStoriesForScope(v1, scopeSibling1Oid, epicCategory, developmentPhase);
        createStoriesForScope(v1, scopeSibling1Oid, epicCategory, testingPhase);
        createStoriesForScope(v1, scopeSibling1Oid, initiativeCategory, OID_NULL);
        createStoriesForScope(v1, scopeSibling1Oid, initiativeCategory, developmentPhase);
        createStoriesForScope(v1, scopeSibling1Oid, initiativeCategory, testingPhase);

        createStoriesForScope(v1, scopeSibling2Oid, epicCategory, OID_NULL);
        createStoriesForScope(v1, scopeSibling2Oid, epicCategory, productionPhase);

        return Promise.resolve();
    }
};