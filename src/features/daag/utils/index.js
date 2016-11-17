import dropMoment from './../../../common/dropMoment';
import times from './../../../common/times';
import { ROOT_SCOPE, DONE_STORY_STATUS } from './../../../common/constants';

export const getScope = async(v1, name, schemeOid) => v1
    .query({
        from: 'Scope', select: ['Name'], where: {Name: name}
    }).then(results => results[0][0]
            ? results[0][0]._oid
            : v1.create('Scope', {
            Name: name,
            Parent: ROOT_SCOPE,
            Scheme: schemeOid,
            BeginDate: '2016-06-28'
        }).then(scope => dropMoment(scope.id))
    );

export const getPhase = (v1, name) => v1
    .query({
        from: 'Phase', select: ['Name'], where: {Name: name}
    }).then(results => results[0][0]
        ? results[0][0]._oid
        : v1.create('Phase', {Name: name}).then(phase => dropMoment(phase.id))
    );

export const getEpicCategories = async(v1, name) => v1
    .query({
        from: 'EpicCategory', select: ['Name'], where: {Name: name}
    }).then(results => results[0][0]
        ? results[0][0]._oid
        : v1.create('EpicCategory', {Name: name}).then(category => dropMoment(category.id))
    );

export const createStory = async(v1, scopeOid) => v1
    .create('Story', {
        Name: 'InProgressStory',
        Scope: scopeOid
    });

export const createDoneStory = async(v1, scopeOid) => v1
    .create('Story', {
        Name: 'DoneStory',
        Status: DONE_STORY_STATUS,
        Scope: scopeOid
    });

export const createChangeSet = async(v1, workitemOids) => v1
    .create('ChangeSet', {
        Name: 'ChangeSet',
        PrimaryWorkitems: workitemOids
    });

export const createBundle = async(v1, phaseOid, packageId, changeSetOids) => v1
    .create('Bundle', {
        Name: `ValveBundle ${packageId}`,
        PackageReference: packageId,
        PackageRevision: 1,
        Phase: phaseOid,
        IsCustomLabel: false,
        ChangeSets: changeSetOids
    });

export const createStoriesForScope = async (v1, scopeOid, epicCategory, phase) => {
    const workitems = await Promise.all(times(10).map(i => createStory(v1, scopeOid)));
    const epic = await v1.create('Epic', {
        Name: 'Valve Epic',
        Category: epicCategory,
        Scope: scopeOid
    });
    await workitems.map(story => Promise.all(
        v1.update(dropMoment(story.id), {
            Super: dropMoment(epic.id)
        })
    ));
    const changeSets = await Promise.all(
        workitems.map(story => createChangeSet(v1, [dropMoment(story.id)]))
    ).then(changeSets => changeSets.map(changeSet => dropMoment(changeSet.id)));
    await createBundle(v1, phase, 'Valve Phase', [
        ...changeSets
    ]);
};

export const createSpreadWorkitem = async () => {
    const MIXED__PACKAGE = 'Mixed spread and non-spread workitem in package';
    const nonSpreadWorkitem = await createStory(v1, scopeOid)
        .then(s=> dropMoment(s.id));
    const nonSpreadChangeSet = await createChangeSet(v1, [nonSpreadWorkitem])
        .then(cs => dropMoment(cs.id));

    const spreadWorkitemWithMoment = await createStory(v1, scopeOid)
        .then(s=> s.id);

    const spreadWorkitem = dropMoment(spreadWorkitemWithMoment);

    const spreadChangeSets = await Promise.all(
        times(6).map(i => createChangeSet(v1, [spreadWorkitem]))
    ).then(changeSets => changeSets.map(changeSet => dropMoment(changeSet.id)));

    await createBundle(v1, developmentPhase, MIXED__PACKAGE, [
        spreadChangeSets[0], spreadChangeSets[1]
    ]);

    await createBundle(v1, testingPhase, MIXED__PACKAGE, [
        spreadChangeSets[2], spreadChangeSets[3], nonSpreadChangeSet
    ]);

    await createBundle(v1, productionPhase, MIXED__PACKAGE, [
        spreadChangeSets[4], spreadChangeSets[5]
    ]);

    return spreadWorkitemWithMoment;
};