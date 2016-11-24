import Runner from './../../runner';
import { makeAdmin } from './utils';

module.exports = class ValveRunner extends Runner {
    constructor(options) {
        super(options);
        this.memberName = options.member || 'valve';
    }

    async command() {
        const v1 = this.authenticateAs('admin', 'admin');
        const memberName = this.memberName;

        return makeAdmin(v1, memberName).then(res => {
            const { name, role, scope } = res;
            console.log(name, role, scope);
            return res;
        });
    }
};