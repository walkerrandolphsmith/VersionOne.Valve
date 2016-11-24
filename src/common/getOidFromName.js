import dropMoment from './dropMoment';
import { ROOT_SCOPE } from './constants';

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