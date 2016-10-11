const Runner = require('./../../runner');
const dropMoment = require('./../utils/dropMoment');
const times = require('./../utils/times');

const getScheme = async (v1, schemeValues) => v1.create('Scheme', {
    Name: 'ValveScheme',
    SelectedValues: schemeValues
});

const getScope = async (v1, schemeOid) => v1.create('Scope', {
    Name: 'ValveScope',
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

const getChangeSets = (v1, workitemOids) => Promise.all(
    workitemOids.map(workitemOid => v1.create('ChangeSet', {
        Name: 'ChangeSet',
        PrimaryWorkitems: [
            workitemOid
        ]
    }))
);

const createStory = async (v1, scopeOid) => v1
    .create('Story', {
        Name: 'InProgressStory',
        Scope: scopeOid
    });

const createDoneStory = async (v1, scopeOid) => v1
    .create('Story', {
        Name: 'DoneStory',
        Status: 'StoryStatus:135',
        Scope: scopeOid
    });

const createChangeSet = async (v1, workitemOids) => v1
    .create('ChangeSet', {
        Name: 'ChangeSet',
        PrimaryWorkitems: workitemOids
    });

const createRougeChangeSets = async (v1) => v1
    .create('ChangeSet', { Name: 'ChangeSet' });

const createBundle = async (v1, phaseOid, packageId, changeSetOids) => v1
    .create('Bundle', {
        Name: `ValveBundle ${packageId}`,
        PackageReference: packageId,
        PackageRevision: 1,
        Phase: phaseOid,
        IsCustomLabel: false,
        ChangeSets: changeSetOids
    });

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
            epicCategory, featureCategory, subFeatureCategory, initiativeCategory
        ];

        const scheme = await getScheme(v1, schemeValues);
        const schemeOid = dropMoment(scheme.id);
        const scope = await getScope(v1, schemeOid);
        const scopeOid = dropMoment(scope.id);

        const doneStories = await Promise.all(times(10).map(i => createDoneStory(v1, scopeOid)));
        const doneChangeSets = await Promise.all(
            doneStories.map(story => createChangeSet(v1, [dropMoment(story.id)] ))
        );

        const onGoingStories = await Promise.all(times(10).map(i => createStory(v1, scopeOid)));
        const onGoingChangeSets = await Promise.all(
            onGoingStories.map(story => createChangeSet(v1, [dropMoment(story.id)] ))
        );

        const rougeStories = await Promise.all(times(10).map(i => createDoneStory(v1, scopeOid)));
        const rougeChangeSets = await Promise.all(
            rougeStories.map(story => createRougeChangeSets(v1))
        );

        const spreadWorkitem = await createStory(v1, scopeOid);
        const spreadChangeSets = await Promise.all(
            times(6).map(i => createChangeSet(v1, [dropMoment(spreadWorkitem.id)] ))
        );

        const sharedWorkitems = await Promise.all(
            times(3).map(i => createStory(v1, scopeOid))
        ).then(workitems => workitems.map(workitem => dropMoment(workitem.id)));
        const sharedChangeSet = await createChangeSet(v1, sharedWorkitems);


        /*--------------------------------------------------------------------------------------------*/
        /*------------------------------------ ROUGE PACKAGE -----------------------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        const ROUGE_PACKAGE = 'Rouge Package';

        await createBundle(v1, developmentPhase, ROUGE_PACKAGE, [
            rougeChangeSets[0], rougeChangeSets[1], rougeChangeSets[3], onGoingChangeSets[0]
        ]);

        await createBundle(v1, testingPhase, ROUGE_PACKAGE, [
            rougeChangeSets[0], rougeChangeSets[1], rougeChangeSets[3], onGoingChangeSets[0], onGoingChangeSets[1]
        ]);

        await createBundle(v1, productionPhase, ROUGE_PACKAGE, [
            rougeChangeSets[3], rougeChangeSets[4], onGoingChangeSets[3]
        ]);

        /*--------------------------------------------------------------------------------------------*/
        /*----------------------------------- FULLY MATURED BUNDLE -----------------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        const MATURED_BUNDLE_PACKAGE = 'Matured Bundle Package';

        await createBundle(v1, developmentPhase, MATURED_BUNDLE_PACKAGE, [
            doneChangeSets[0], doneChangeSets[1], doneChangeSets[2], doneChangeSets[3]
        ]);

        await createBundle(v1, testingPhase, MATURED_BUNDLE_PACKAGE, [
            doneChangeSets[0], doneChangeSets[1], doneChangeSets[2], doneChangeSets[3]
        ]);

        await createBundle(v1, productionPhase, MATURED_BUNDLE_PACKAGE, [
            doneChangeSets[0], doneChangeSets[1], doneChangeSets[2], doneChangeSets[3]
        ]);

        /*--------------------------------------------------------------------------------------------*/
        /*--------------------------- MIXED WORKITEM STATUS BUNDLE -----------------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        const MIXED_WI_STATUS_PACKAGE = 'Matured Bundle Package';

        await createBundle(v1, developmentPhase, MIXED_WI_STATUS_PACKAGE, [
            doneChangeSets[0], doneChangeSets[1], doneChangeSets[2], onGoingChangeSets[0], onGoingChangeSets[1]
        ]);

        /*--------------------------------------------------------------------------------------------*/
        /*----------------------------------- SHARED COMMIT BUNDLE -----------------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        const SHARED_COMMIT_PACKAGE = 'Shared Commit Package';

        await createBundle(v1, developmentPhase, SHARED_COMMIT_PACKAGE, [
            sharedChangeSet
        ]);

        /*--------------------------------------------------------------------------------------------*/
        /*----------------------------------- SPREAD WORKITEM BUNDLE ---------------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        const SPREAD__PACKAGE = 'Spread workitem in package';

        await createBundle(v1, developmentPhase, SPREAD__PACKAGE, [
            spreadChangeSets[0], spreadChangeSets[1]
        ]);

        await createBundle(v1, testingPhase, SPREAD__PACKAGE, [
            spreadChangeSets[2], spreadChangeSets[3]
        ]);

        await createBundle(v1, productionPhase, SPREAD__PACKAGE, [
            spreadChangeSets[4], spreadChangeSets[5]
        ]);

        return Promise.all(getEpics(v1, scopeOid))
            .then(epics => getWorkitems(v1, scopeOid, epics))
            .then(workitems => workitems.map(wi => dropMoment(wi.id)))
            .then(workitemOids => getChangeSets(v1, workitemOids));
    }
};