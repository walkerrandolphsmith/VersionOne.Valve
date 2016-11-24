import dropMoment from './dropMoment';
import { ROOT_SCOPE, ADMIN_ROLE } from './constants';

const getOidFromName = async (v1, assetType, name, attributes = {}) => {
    if(!assetType || !name) throw new Error('AssetType and name required.');
    const attrs = Object.assign({}, { Name: name }, attributes);
    return await v1.query({
        from: assetType, select: ['Name'], where: { Name: name }
    }).then(assets => assets[0][0] ? assets[0][0]._oid : v1.create(assetType, attrs).then(a => dropMoment(a.id)));
};

export default getOidFromName;

export const getScope = async (v1, name, attributes = {}) => {
    const attrs = Object.assign({}, {
        Parent: ROOT_SCOPE,
        //Scheme: schemeOid, what is a default scheme oid?
        BeginDate: '2016-06-28'
    }, attributes);

    return await getOidFromName(v1, 'Scope', name, attrs);
};

export const getPhase = async (v1, name) => await getOidFromName(v1, 'Phase', name);

export const getMember = async (v1, name, attributes = {}) =>  {
    const attrs = Object.assign({}, {
        Username: name,
        Password: name,
        DefaultRole : ADMIN_ROLE,
        IsCollaborator : false,
        Nickname : name,
        NotifyViaEmail : true,
        SendConversationEmails : true
    }, attributes);

    return await getOidFromName(v1, 'Member', name, attrs);
};