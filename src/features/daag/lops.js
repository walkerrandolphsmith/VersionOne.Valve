import Runner from './../../runner';
import dropMoment from './../../common/dropMoment';
import times from './../../common/times';
import { getScope, getPhase } from './../../common/getOidFromName';
import { DONE_STORY_STATUS } from './../../common/constants';
import { getEpicCategories } from './utils';

const SCOPE_NAME = 'LOPS.js';

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

        const scopeOid = await getScope(v1, SCOPE_NAME, { Scheme: schemeOid });

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
            times(100).map(async (i) => await v1.create('Story', {
                Name: 'Story ' + i,
                Scope: scopeOid,
                Super: dropMoment(epic.id)
            })
        )));

        return Promise.resolve();
    }
};