import Runner from './../../runner';
import dropMoment from './../../common/dropMoment';
import times from './../../common/times';
import { DONE_STORY_STATUS, OID_NULL } from './../../common/constants';
import {
    getScope,
    getPhase,
    getEpicCategories,
    createStory,
    createDoneStory,
    createChangeSet,
    createBundle
} from './utils';

const SCOPE_NAME = 'LOE SPREAD Scope 4';


module.exports = class ValveRunner extends Runner {
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

        const schemeOid = await v1.create('Scheme', {
            Name: 'ValveScheme',
            SelectedValues: schemeValues
        }).then(scheme => dropMoment(scheme.id));

        const scopeOid = await getScope(v1, SCOPE_NAME, schemeOid);
		
		/*--------------------------------------------------------------------------------------------*/
        /*---------------------- SPREAD AND UNSPREAD WORKITEM BUNDLE ---------------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        console.log('SPREAD & UNSPREAD WORKITEM BUNDLE');
		
		const createSpreadWorkitem = async () => {
			const MIXED__PACKAGE = 'Mixed spread and non-spread workitem in package';
			const nonSpreadWorkitem = await createStory(v1, scopeOid)
											.then(s=> dropMoment(s.id));
			const nonSpreadChangeSet = await createChangeSet(v1, [nonSpreadWorkitem])
												.then(cs => dropMoment(cs.id))
			
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
		}

        
		
		
		
		let loeEpics = [];
		let epicCount = 0;
        while (loeEpics.length < 300) {
			let result = await v1.create('Epic', {
                    Name: 'ValveEpic LoadEpic ' + epicCount++,
                    Category: epicCategory,
                    Scope: scopeOid
                });
			loeEpics.push(result);
        }

        console.log('creating stories on epics');
        var once = false; 
        while (loeEpics.length > 0) {
			console.log("epics remaining: ", loeEpics.length);
			await Promise.all(loeEpics.slice(0, 2).map(async(epic) => {
				const numberOfItems = once ? 10 : 100;
				once = true;
				await Promise.all(times(30).map(async (i)=> {
						let swi = await createSpreadWorkitem();
						return v1.update(swi, {
							 Super: dropMoment(epic.id)
						})
					}
				));

            }));

            loeEpics.splice(0, 2);
		}

        return Promise.resolve();
    }
};