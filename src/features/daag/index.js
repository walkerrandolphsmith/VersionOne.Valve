const Runner = require('./../../runner');
const dropMoment = require('./../utils/dropMoment');
const times = require('./../utils/times');

const getScheme = async (v1, schemeValues) => v1.create('Scheme', {
    Name: 'ValveScheme',
    SelectedValues: schemeValues
});

const getScope = async (v1, schemeOid) => v1.create('Scope', {
    Name: 'ValveScope1000',
    Parent: 'Scope:0',
    Scheme: schemeOid,
    BeginDate: '2016-06-28'
});

const getPhase = (v1, name) => v1
    .query({
        from: 'Phase', select: ['Name'], where: { Name: name }
    }).then(results => results[0][0]
        ? results[0][0]._oid
        : v1.create('Phase', { Name: name }).then(phase => dropMoment(phase.id))
    );

const getEpicCategories = async (v1, name) => v1
    .query({
        from: 'EpicCategory', select: ['Name'], where: { Name: name }
    }).then(results => results[0][0]
        ? results[0][0]._oid
        : v1.create('EpicCategory', { Name: name }).then(category => dropMoment(category.id))
    );

const getEpics = (v1, scopeOid) => times(10).map(i => v1.create('Epic', {
    Name: `ValveEpic${i}`,
    Scope: scopeOid
}));

const getWorkitems = (v1, scopeOid, epics) => Promise.all(
    epics
        .reduce((promises, epic) => promises.concat(
            times(10).map(i => v1.create((i % 2 === 0 ? 'Story' : 'Defect'), {
                Name: `ValveStory${i}`,
                Scope: scopeOid,
                Super: dropMoment(epic.id)
            }))
        ), [])
);

const getChangeSets = (v1, workitems) => Promise.all(
    workitems.map(workitem => {
        const workitemOid = dropMoment(workitem.id);
        return v1.create('ChangeSet', {
            Name: 'ChangeSet',
            PrimaryWorkitems: [
                workitemOid
            ]
        })
    })
);

module.exports = class Daag extends Runner {
    command = async () => {
        const v1 = this.authenticateAs('admin', 'admin');

        const phases = await Promise.all([
            getPhase(v1, 'Testing'),
            getPhase(v1, 'Development'),
            getPhase(v1, 'Production')
        ]);

        const epicCategory = await getEpicCategories(v1, 'Epic');
        const featureCategory = await getEpicCategories(v1, 'Feature');
        const subFeatureCategory = await getEpicCategories(v1, 'SubFeature');
        const initiativeCategory = await getEpicCategories(v1, 'Initiative');

        const schemeValues = phases.concat([
            epicCategory, featureCategory, subFeatureCategory, initiativeCategory
        ]);

        const scheme = await getScheme(v1, schemeValues);
        const schemeOid = dropMoment(scheme.id);
        const scope = await getScope(v1, schemeOid);
        const scopeOid = dropMoment(scope.id);
        return Promise.all(getEpics(v1, scopeOid))
            .then(epics => getWorkitems(v1, scopeOid, epics))
            .then(workitems => getChangeSets(v1, workitems));
    }
};