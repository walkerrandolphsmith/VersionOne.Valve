import Runner from './../../runner';
import dropMoment from './../../common/dropMoment';
import times from './../../common/times';
import { DONE_STORY_STATUS } from './../../common/constants';
import { getScope, getPhase } from './../../common/getOidFromName';

const SCOPE_NAME = 'Many Phase Scope';

module.exports = class ValveRunner extends Runner {
    async command() {
        const v1 = this.authenticateAs('admin', 'admin');

        const phases = await Promise.all(
            times(20).map(i => getPhase(v1, `Phase ${i}`))
        );

        const schemeValues = [
            ...phases,
            DONE_STORY_STATUS
        ];

        const schemeOid = await v1.create('Scheme', {
            Name: 'ValveScheme',
            SelectedValues: schemeValues
        }).then(scheme => dropMoment(scheme.id));

        await getScope(v1, SCOPE_NAME, { Scheme: schemeOid });

        return Promise.resolve();
    }
};
