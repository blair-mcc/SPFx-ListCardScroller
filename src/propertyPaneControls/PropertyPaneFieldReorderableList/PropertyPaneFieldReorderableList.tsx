import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  IPropertyPaneCustomFieldProps,
  IPropertyPaneField,
  PropertyPaneFieldType
} from '@microsoft/sp-property-pane';
import {
  IPropertyPaneFieldReorderableListProps
} from './IPropertyPaneFieldReorderableList';
import PropertyPaneFieldReorderableListHost from './PropertyPaneFieldReorderableListHost';

export function PropertyPaneFieldReorderableList(
  targetProperty: string,
  properties: IPropertyPaneFieldReorderableListProps
): IPropertyPaneField<IPropertyPaneCustomFieldProps> {
  let elem: HTMLElement;

  return {
    type: PropertyPaneFieldType.Custom,
    targetProperty,
    properties: {
      key: properties.key,
      onRender: (domElement: HTMLElement, _, changeCallback) => {
        elem = domElement;

        const handleChange = (newValue: string[]) => {
          properties.onPropertyChange(targetProperty, newValue);
          if (changeCallback) {
            changeCallback(); // safe to call now
          }
        };

        ReactDom.render(
          <PropertyPaneFieldReorderableListHost
            label={properties.label}
            options={properties.options}
            selectedKeys={properties.selectedKeys}
            onChange={handleChange}
          />,
          domElement
        );
      },
      onDispose: () => {
        if (elem) ReactDom.unmountComponentAtNode(elem);
      }
    }
  };
}
