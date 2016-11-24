import { getMember } from './../../../common/getOidFromName';
import { ROOT_SCOPE, ADMIN_ROLE } from './../../../common/constants';

export const makeAdmin = async (v1, memberName) => {
    const memberOid = await getMember(v1, memberName);

    const relativeUrl = 'ui.v1?gadget=%2fWidgets%2fLists%2fAdmin%2fMemberRoleProjectList%2fGadget';

    const payload = {
        "gadget":"/Widgets/Lists/Admin/MemberRoleProjectList/Gadget",
        "Settings":{
            "UserDefinedSort":null,
            "NewFilter":{
                "Expander":{
                    "IsExpanded":"False"
                },
                "SelectedMyFilterResolverKey":"Custom/WidgetsListsAdminMemberRoleProjectListNewFilter/SelectedMyFilter"
            },
            "Query":{
                "CompanyFilterApplicators":{
                    "0":"Custom/WidgetsListsAdminMemberRoleProjectListQuery/ScopeCustomProjectHealth",
                    "1":"Custom/WidgetsListsAdminMemberRoleProjectListQuery/ScopeStatus",
                    "2":"Custom/WidgetsListsAdminMemberRoleProjectListQuery/ScopePlanningLevel",
                    "":"0,1,2"
                },
                "FindResolverKey":"Custom/WidgetsListsAdminMemberRoleProjectListQuery/FindValue",
                "OrderByToken":null
            },
            "SelectAssetContext":null,
            "Expander":{
                "IsExpanded":null
            },
            "MajorSort":"$Column3",
            "SortOrder":null
        },
        "FirstRowIndex":0,
        "id":"_ergfatq",
        "ContextManager":{
            "PrimaryScopeContext": ROOT_SCOPE,
            "ScopeRollup":true,
            "AssetContext": memberOid,
            "AssetListContext":"",
            "Bubble": memberOid,
            "ScopeLabel":"-"
        },"SelectedRow":{
            "selectedKey":"_v1_asset",
            "selected": ROOT_SCOPE
        },
        "SaveRoles":[
            {
                "memberoid": memberOid,
                "scopeoid": ROOT_SCOPE,
                "roleoid": ADMIN_ROLE,
                "onownerlist":false
            }
        ],
        "SaveAssets":null,
        "TreeState":{
            [ROOT_SCOPE]: true
        }
    };
    return v1.setMemberRoles(relativeUrl, payload).then(res => ({
        name: memberName,
        role: ADMIN_ROLE,
        scope: ROOT_SCOPE
    }));
};