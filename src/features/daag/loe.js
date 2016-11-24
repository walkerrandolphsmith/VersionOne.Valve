import Runner from './../../runner';
import dropMoment from './../../common/dropMoment';
import times from './../../common/times';
import {
    getDaagScope
    createStory,
    createChangeSet
} from './utils';

const SCOPE_NAME = 'ValveScope 100 for one 10 for the rest';

module.exports = class ValveRunner extends Runner {
    async command() {
        const v1 = this.authenticateAs('admin', 'admin');

        const scopeOid = await getDaagScope(v1, SCOPE_NAME);

        /*--------------------------------------------------------------------------------------------*/
        /*---------------------------------- Create tons of epics ------------------------------------*/
        /*--------------------------------------------------------------------------------------------*/


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
                const loeStories = await Promise.all(times(numberOfItems).map(i => createStory(v1, scopeOid)));
                const loeChangeSets = await Promise.all(
                    loeStories.map(story => createChangeSet(v1, [dropMoment(story.id)]))
                ).then(changeSets => changeSets.map(changeSet => dropMoment(changeSet.id)));

                return Promise.all(
                    loeStories.map(story => v1.update(dropMoment(story.id), {
                        Super: dropMoment(epic.id)
                    }))
                )
            }));

            loeEpics.splice(0, 2);
        }

        return Promise.resolve();
    }
};
