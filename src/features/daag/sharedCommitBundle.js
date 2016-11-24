import Runner from './../../runner';
import dropMoment from './../../common/dropMoment';
import times from './../../common/times';
import {
    getDaagScope
    createStory,
    createChangeSet,
    createBundle
} from './utils';

const SCOPE_NAME = 'ValveScope';


module.exports = class ValveRunner extends Runner {
    async command() {
        const v1 = this.authenticateAs('admin', 'admin');

        const { scopeOid, developmentPhase } = await getDaagScope(v1, SCOPE_NAME);

        /*--------------------------------------------------------------------------------------------*/
        /*----------------------------------- SHARED COMMIT BUNDLE -----------------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        console.log('SHARED COMMIT BUNDLE');

        const SHARED_COMMIT_PACKAGE = 'Shared Commit Package';

        const sharedWorkitems = await Promise.all(
            times(3).map(i => createStory(v1, scopeOid))
        ).then(workitems => workitems.map(workitem => dropMoment(workitem.id)));
        const sharedChangeSet = await createChangeSet(v1, sharedWorkitems)
            .then(changeSet => dropMoment(changeSet.id));

        await createBundle(v1, developmentPhase, SHARED_COMMIT_PACKAGE, [
            sharedChangeSet
        ]);

        return Promise.resolve();
    }
};
