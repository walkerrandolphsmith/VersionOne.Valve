import Runner from './../../runner';
import dropMoment from './../../common/dropMoment';
import times from './../../common/times';
import { getDaagScope, createBundle } from './utils';

const SCOPE_NAME = 'ValveScope';


module.exports = class ValveRunner extends Runner {
    async command() {
        const v1 = this.authenticateAs('admin', 'admin');

        const { developmentPhase } = await getDaagScope(v1, SCOPE_NAME);

        /*--------------------------------------------------------------------------------------------*/
        /*------------------------------------ ROUGE PACKAGE -----------------------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        console.log('ROUGE PACKAGE');

        const ROUGE_PACKAGE = 'Rouge Package';

        const rougeChangeSets = await Promise.all(
            times(10).map(i => v1.create('ChangeSet', {Name: 'ChangeSet'}))
        ).then(changeSets => changeSets.map(changeSet => dropMoment(changeSet.id)));

        await createBundle(v1, developmentPhase, ROUGE_PACKAGE, rougeChangeSets);

        return Promise.resolve();
    }
};
