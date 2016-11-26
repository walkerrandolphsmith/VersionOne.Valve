import Runner from './../../runner';
import dropMoment from './../../common/dropMoment';
import times from './../../common/times';
import throttler from './../../common/throttler';
import {
    getDaagScope
    createStory,
    createChangeSet,
    createSpreadWorkitem
} from './utils';

const SCOPE_NAME = 'ValveScope 100 for one 10 for the rest';

module.exports = class ValveRunner extends Runner {
    async command() {
        const v1 = this.authenticateAs('admin', 'admin');

        const {
            scopeOid, epicCategory,
            developmentPhase, testingPhase, productionPhase
        } = await getDaagScope(v1, SCOPE_NAME);

        /*--------------------------------------------------------------------------------------------*/
        /*---------------------------------- Create tons of epics ------------------------------------*/
        /*--------------------------------------------------------------------------------------------*/


        const epicPromises = times(1000).map((epicCount) => {
            return () => v1.create('Epic', {
                Name: 'ValveEpic LoadEpic ' + epicCount,
                Category: epicCategory,
                Scope: scopeOid
            })
        });
        let loeEpics = await throttler(epicPromises, 25);

        console.log('creating stories on epics');

        const storyPromises = loeEpics.map((epic)=>{
            return () => Promise.all(times(10).map(async (i)=> {
                    const swi = await createSpreadWorkitem(v1, scopeOid, developmentPhase, testingPhase, productionPhase);
                    return v1.update(swi, {
                        Super: dropMoment(epic.id)
                    })
                }
            ))
        });
        await throttler(storyPromises, 25);
        return Promise.resolve();
    }
};
