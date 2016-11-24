import Runner from './../../runner';
import dropMoment from './../../common/dropMoment';
import throttler from './../../common/throttler';
import times from './../../common/times';
import { getDaagScope, createSpreadWorkitem } from './utils';

/*--------------------------------------------------------------------------------------------*/
/*------------------------------ WHAT DO YOU WANT TO CREATE? ---------------------------------*/
/*--------------------------------------------------------------------------------------------*/

const SCOPE_NAME = 'LOE SPREAD Scope - Throttler1';
const NUM_OF_EPICS = 200;
const EPICS_AT_A_TIME = 5;
const NUM_OF_STORIES = 10;
const STORIES_AT_A_TIME = 2;

module.exports = class ValveRunner extends Runner {
    async command() {
        const v1 = this.authenticateAs('admin', 'admin');

        const {
            scopeOid, developmentPhase, testingPhase, productionPhase, epicCategory
        } = await getDaagScope(v1, SCOPE_NAME);
        
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
                    let swi = await createSpreadWorkitem(v1, scopeOid, developmentPhase, testingPhase, productionPhase);
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