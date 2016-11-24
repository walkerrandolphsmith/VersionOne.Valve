import Runner from './../../runner';
import times from './../../common/times';
import throttler from './../../common/throttler';
import { getDaagScope, createStory } from './utils';

const SCOPE_NAME = 'Show Backlog Link';

module.exports = class ValveRunner extends Runner {
    async command() {
        const v1 = this.authenticateAs('admin', 'admin');

        const scopeOid = await getDaagScope(v1, SCOPE_NAME);

        /*--------------------------------------------------------------------------------------------*/
        /*------------------------------- Show Backlog Link ------------------------------------------*/
        /*--------------------------------------------------------------------------------------------*/
        
        const promises = times(151).map(() => () => createStory(v1, scopeOid));
        const stories = await throttler(promises, 25);

        return Promise.resolve(stories);
    }
};
