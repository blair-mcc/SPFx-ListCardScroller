import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption
} from '@microsoft/sp-property-pane';
import { ThemeProvider, ThemeChangedEventArgs } from '@microsoft/sp-component-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { ListCardScroller, IListCardScrollerProps } from './components/SpListCardScroller';
import { getSP } from '../../pnpjsConfig';
import { PropertyPaneFieldReorderableList } from '../../propertyPaneControls/PropertyPaneFieldReorderableList/PropertyPaneFieldReorderableList';
export interface IListCardScrollerWebPartProps {
  listTitle: string;
  titleField: string;
  descriptionFields: string[];
  footerField: string;
  [key: string]: any;
}

export default class ListCardScrollerWebPart extends BaseClientSideWebPart<IListCardScrollerWebPartProps> {
  private _listOptions: IPropertyPaneDropdownOption[] = [];
  private _fieldOptions: IPropertyPaneDropdownOption[] = [];
  private _themeProvider: ThemeProvider;
  private _themeVariant: IReadonlyTheme | undefined;

  public async onInit(): Promise<void> {
    await super.onInit();

    this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);
    this._themeVariant = this._themeProvider.tryGetTheme();

    this._themeProvider.themeChangedEvent.add(this, this._handleThemeChanged);

    getSP(this.context);
    await this._loadLists();

    if (this.properties.listTitle) {
      await this._loadFields(this.properties.listTitle);
    }
  }


  public render(): void {
    const element: React.ReactElement<IListCardScrollerProps> = React.createElement(
      ListCardScroller,
      {
        siteUrl: this.context.pageContext.web.absoluteUrl,
        listTitle: this.properties.listTitle,
        titleField: this.properties.titleField,
        descriptionFields: this.properties.descriptionFields,
        footerField: this.properties.footerField,
        theme: this._themeVariant
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  public getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Configure the List Card Scroller' },
          groups: [
            {
              groupName: 'List and Field Settings',
              groupFields: [
                PropertyPaneDropdown('listTitle', {
                  label: 'Select List',
                  options: this._listOptions
                }),
                PropertyPaneDropdown('titleField', {
                  label: 'Title Field',
                  options: this._fieldOptions
                }),
                PropertyPaneFieldReorderableList('descriptionFields', {
                    key: 'descriptionFields',
                    label: 'Description Fields',
                    options: this._fieldOptions,
                    selectedKeys: this.properties.descriptionFields || [],
                    onPropertyChange: this._onPropertyPaneChange.bind(this)
                    }),
                PropertyPaneDropdown('footerField', {
                  label: 'Footer Field',
                  options: this._fieldOptions
                })
              ]
            }
          ]
        }
      ]
    };
  }

  private async _loadLists(): Promise<void> {
    const sp = getSP();
    const lists = await sp.web.lists
      .filter("Hidden eq false and BaseTemplate eq 100")()

    this._listOptions = lists.map(list => ({
      key: list.Title,
      text: list.Title
    }));
  }

  private async _loadFields(listTitle: string): Promise<void> {
    const sp = getSP();
    const fields = await sp.web.lists.getByTitle(listTitle).fields()
    const usableFields = fields.filter(f => !f.Hidden && !f.ReadOnlyField);

    this._fieldOptions = usableFields.map(field => ({
      key: field.InternalName,
      text: field.Title
    }));
  }

    private _onPropertyPaneChange(propertyPath: string, newValue: string[]): void {
        this.properties[propertyPath] = newValue;
    }

    public async onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): Promise<void> {
        if (propertyPath === 'listTitle' && newValue !== oldValue) {
            this.properties.titleField = '';
            this.properties.footerField = '';
            this.properties.descriptionFields = [];

            await this._loadFields(newValue);
            this.context.propertyPane.refresh();
        }

        return super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
    }

  private _handleThemeChanged(args: ThemeChangedEventArgs): void {
    this._themeVariant = args.theme;
    this.render();
  }

} 
