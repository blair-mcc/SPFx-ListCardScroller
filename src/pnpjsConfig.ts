import { spfi, SPFI } from '@pnp/sp';
import { SPFx } from '@pnp/sp';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";


let _sp: SPFI;

export const getSP = (context?: WebPartContext): SPFI => {
  if (!_sp && context) {
    _sp = spfi().using(SPFx(context));
  }
  return _sp;
};
