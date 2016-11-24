import Runner from './../../runner';
import dropMoment from './../../common/dropMoment';
import times from './../../common/times';
import {
    getDaagScope,
    createStory,
    createChangeSet,
    createBundle
} from './utils';

const SCOPE_NAME = 'ValveScope';

module.exports = class ValveRunner extends Runner {
    async command() {
        const v1 = this.authenticateAs('admin', 'admin');

        const scopeOid = await getDaagScope(v1, SCOPE_NAME);

        /*--------------------------------------------------------------------------------------------*/
        /*----------------------------------- SPREAD WORKITEM BUNDLE ---------------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        console.log('SPREAD WORKITEM BUNDLE');

        const SPREAD__PACKAGE = 'Spread workitem in package';

        const spreadWorkitem = await createStory(v1, scopeOid);
        const spreadChangeSets = await Promise.all(
            times(6).map(i => createChangeSet(v1, [dropMoment(spreadWorkitem.id)]))
        ).then(changeSets => changeSets.map(changeSet => dropMoment(changeSet.id)));

        await createBundle(v1, developmentPhase, SPREAD__PACKAGE, [
            spreadChangeSets[0], spreadChangeSets[1]
        ]);

        await createBundle(v1, testingPhase, SPREAD__PACKAGE, [
            spreadChangeSets[2], spreadChangeSets[3]
        ]);

        await createBundle(v1, productionPhase, SPREAD__PACKAGE, [
            spreadChangeSets[4], spreadChangeSets[5]
        ]);

        return Promise.resolve();
    }
};
