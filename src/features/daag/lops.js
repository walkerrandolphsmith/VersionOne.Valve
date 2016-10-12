import Runner from './../../runner';
import dropMoment from './../../common/dropMoment';
import times from './../../common/times';
import { DONE_STORY_STATUS, OID_NULL } from './../../common/constants';
import {
    getScope,
    getPhase,
    getEpicCategories,
    createStory
} from './utils';

const SCOPE_NAME = 'LopsScope';

module.exports = class ValveRunner extends Runner {
    async command() {
        const v1 = this.authenticateAs('admin', 'admin');
        const developmentPhase = await getPhase(v1, 'Development');
        const epicCategory = await getEpicCategories(v1, 'Epic');

        const schemeValues = [epicCategory, developmentPhase, DONE_STORY_STATUS];

        const schemeOid = await v1.create('Scheme', {
            Name: 'LopsScheme',
            SelectedValues: schemeValues
        }).then(scheme => dropMoment(scheme.id));

        const scopeOid = await getScope(v1, SCOPE_NAME, schemeOid);

        /*--------------------------------------------------------------------------------------------*/
        /*---------------------------------- Create ten epics each with 1000  ------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        const epics = await Promise.all(
            times(10).map(i => v1.create('Epic', {
                Name: `Lops Epic ${i}`,
                Category: epicCategory,
                Scope: scopeOid
            }))
        );

        await epics.map(epic => Promise.all(
            times(1000).map(async (i) => await createStory(v1, scopeOid, dropMoment(epic.id)))
        ));

        return Promise.resolve();
    }
};