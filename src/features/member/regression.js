import Runner from './../../runner';
import throttler from './../../common/throttler';
import { makeAdmin } from './utils';

module.exports = class ValveRunner extends Runner {
    constructor(options) {
        super(options);
    }

    async command() {
        const v1 = this.authenticateAs('admin', 'admin');

        const teamH = [
            'walker',
            'claire',
            'keith',
            'kevin',
            'alejandro',
            'mickey'
        ];

        const teamI = [
            'andrew',
            'matt',
            'allers',
            'tony',
            'erin',
            'greg',
            'rino'
        ];

        const teamB = [
            'jeannine',
            'madison',
            'amy',
            'rd',
            'sean',
            'micheal'
        ];

        const teamO = [
            'shawnmarie',
            'denise',
            'corey',
            'josh',
            'matias',
            'mark'
        ];

        const teamQ = [
            'cathy',
            'dan',
            'amitair'
        ];

        const memberNames = [
            ...teamH,
            ...teamI,
            ...teamB,
            ...teamO,
            ...teamQ
        ];

        const promises = memberNames.map(name => () => makeAdmin(v1, name));
        const members = await throttler(promises, 25);

        members.map(member => {
            console.log(`${member.name} was created with the ${member.role} role`);
        });
    }
};