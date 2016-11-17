import Runner from './../../runner';
import dropMoment from './../../common/dropMoment';
import throttler from './../../common/throttler';
import times from './../../common/times';
import { DONE_STORY_STATUS, OID_NULL } from './../../common/constants';
import {
    getScope,
    getPhase,
    getEpicCategories,
    createSpreadWorkitem
} from './utils';

/*--------------------------------------------------------------------------------------------*/
/*------------------------------ WHAT DO YOU WANT TO CREATE? ---------------------------------*/
/*--------------------------------------------------------------------------------------------*/

const SCOPE_NAME = 'LOE SPREAD Scope - Throttler3';
const NUM_OF_EPICS = 200;
const EPICS_AT_A_TIME = 5;
const NUM_OF_STORIES = 10;
const STORIES_AT_A_TIME = 2;

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
		
		const epicPromises = times(NUM_OF_EPICS).map((epicCount) => {
			return () => v1.create('Epic', {
				Name: 'ValveEpic LoadEpic ' + epicCount,
				Category: epicCategory,
				Scope: scopeOid
			})
		});
		let loeEpics = await throttler(epicPromises, EPICS_AT_A_TIME);

        console.log('creating stories on epics');

		const storyPromises = loeEpics.map((epic)=>{
			return () => Promise.all(times(NUM_OF_STORIES).map(async (i)=> {
					let swi = await createSpreadWorkitem();
					return v1.update(swi, {
						Super: dropMoment(epic.id)
					})
				}
			))
		});
		await throttler(storyPromises, STORIES_AT_A_TIME);

        return Promise.resolve();
    }
};