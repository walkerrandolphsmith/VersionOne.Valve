const Runner = require('./../../src/runner');
const dropMoment = require('./../utils/dropMoment');
const times = require('./../utils/times');

const getScheme = (v1, phaseOids) => v1.create('Scheme', {
    Name: 'ValveScheme',
    SelectedValues: phaseOids
});

const getScope = (v1, schemeOid) => v1.create('Scope', {
    Name: 'ValveScope1000',
    Parent: 'Scope:0',
    Scheme: schemeOid,
    BeginDate: '2016-06-28'
});

const getPhase = (v1, name) => v1
    .query({
        from: 'Phase',
        select: ['Name'],
        where: {
            Name: name
        }
    }).then(results => {
        if(results[0][0]) {
            return results[0][0]._oid
        } else {
            return v1.create('Phase', { Name: name }).then(phase => dropMoment(phase.id))
        }
    });

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
    command() {
        const v1 = this.authenticateAs('admin', 'admin');

        const phases = [
            getPhase(v1, 'Testing'),
            getPhase(v1, 'Development'),
            getPhase(v1, 'Production')
        ];

        return Promise.all(phases)
            .then(phaseOids => {
                return getScheme(v1, phaseOids)
                    .then(scheme => {
                        const schemeOid = dropMoment(scheme.id);
                        return getScope(v1, schemeOid)
                            .then(scope => {
                                const scopeOid = dropMoment(scope.id);
                                return Promise.all(getEpics(v1, scopeOid))
                                    .then(epics => getWorkitems(v1, scopeOid, epics))
                                    .then(workitems => getChangeSets(v1, workitems));
                            });
                    });
            });
    }
};