import { spfi, SPFI } from '@pnp/sp';
import { SPFx } from '@pnp/sp';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";
import "@pnp/sp/views";


let _sp: SPFI | null = null;

export const getSP = (): SPFI => {
  if (!_sp) {
    console.error("PnPjs was not initialized. Call initSP(context) before using getSP().");
    throw Error("PnPjs not initialized");
  }
  return _sp;
};


export const initSP = (context: WebPartContext): void => {
  _sp = spfi().using(SPFx(context));
};
