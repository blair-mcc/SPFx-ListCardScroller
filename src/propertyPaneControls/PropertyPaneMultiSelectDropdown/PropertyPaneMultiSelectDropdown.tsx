import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  IPropertyPaneCustomFieldProps,
  IPropertyPaneField,
  PropertyPaneFieldType
} from '@microsoft/sp-property-pane';
import {
  IPropertyPaneMultiSelectDropdownProps
} from './IPropertyPaneMultiSelectDropdown';
import PropertyPaneMultiSelectDropdownHost from './PropertyPaneMultiSelectDropdownHost';

export function PropertyPaneMultiSelectDropdown(
  targetProperty: string,
  properties: IPropertyPaneMultiSelectDropdownProps
): IPropertyPaneField<IPropertyPaneCustomFieldProps> {
  let elem: HTMLElement;

  const customField: IPropertyPaneField<IPropertyPaneCustomFieldProps> = {
    type: PropertyPaneFieldType.Custom,
    targetProperty,
    properties: {
      key: properties.key,
      onRender: (domElement: HTMLElement) => {
        elem = domElement;
        const onChange = (selectedKeys: string[]) => {
          properties.onPropertyChange(targetProperty, selectedKeys);
        };

        ReactDom.render(
          <PropertyPaneMultiSelectDropdownHost
            label={properties.label}
            options={properties.options}
            selectedKeys={properties.selectedKeys}
            onChange={onChange}
          />,
          domElement
        );
      },
      onDispose: () => {
        if (elem) ReactDom.unmountComponentAtNode(elem);
      }
    }
  };

  return customField;
}
