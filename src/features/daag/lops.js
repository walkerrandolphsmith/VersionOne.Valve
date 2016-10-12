const Runner = require('./../../runner');
const dropMoment = require('./../utils/dropMoment');
const times = require('./../utils/times');
import { DONE_STORY_STATUS, OID_NULL } from './../../constants';

const SCOPE_NAME = 'LopsScope';

const getPhase = (v1, name) => v1
    .query({
        from: 'Phase', select: ['Name'], where: {Name: name}
    }).then(results => results[0][0]
        ? results[0][0]._oid
        : v1.create('Phase', {Name: name}).then(phase => dropMoment(phase.id))
    );

const getScope = async(v1, name, schemeOid) => v1
    .query({
        from: 'Scope', select: ['Name'], where: {Name: name}
    }).then(results => results[0][0]
            ? results[0][0]._oid
            : v1.create('Scope', {
            Name: name,
            Parent: 'Scope:0',
            Scheme: schemeOid,
            BeginDate: '2016-06-28'
        }).then(scope => dropMoment(scope.id))
    );

const getEpicCategories = async(v1, name) => v1
    .query({
        from: 'EpicCategory', select: ['Name'], where: {Name: name}
    }).then(results => results[0][0]
        ? results[0][0]._oid
        : v1.create('EpicCategory', {Name: name}).then(category => dropMoment(category.id))
    );

const createStory = async(v1, scopeOid, epicOid) => v1
    .create('Story', {
        Name: 'Lop Story',
        Scope: scopeOid,
        Super: epicOid
    });

module.exports = class Daag extends Runner {
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