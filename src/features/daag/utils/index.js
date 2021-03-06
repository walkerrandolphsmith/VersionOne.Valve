import dropMoment from './../../../common/dropMoment';
import times from './../../../common/times';
import { getScope, getPhase } from './../../../common/getOidFromName';
import { DONE_STORY_STATUS } from './../../../common/constants';

export const getDaagScope = async (v1, scopeName) => {
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

    const scopeOid = await getScope(v1, scopeName, { Scheme: schemeOid });

    return { 
        scopeOid, schemeOid, 
        developmentPhase, testingPhase, productionPhase,
        epicCategory, featureCategory, subFeatureCategory, initiativeCategory
    };
};


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

export const createSpreadWorkitem = async (v1, scopeOid, developmentPhase, testingPhase, productionPhase) => {
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