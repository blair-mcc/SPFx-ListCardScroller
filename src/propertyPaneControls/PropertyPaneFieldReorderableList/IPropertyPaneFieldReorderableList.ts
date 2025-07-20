import { IPropertyPaneCustomFieldProps } from '@microsoft/sp-property-pane';
import { IDropdownOption } from '@fluentui/react/lib/Dropdown';

export interface IPropertyPaneFieldReorderableListProps {
  key: string;
  label: string;
  options: IDropdownOption[];
  selectedKeys: string[];
  onPropertyChange: (propertyPath: string, newValue: string[]) => void;
}

export interface IPropertyPaneFieldReorderableListInternalProps
  extends IPropertyPaneFieldReorderableListProps,
    IPropertyPaneCustomFieldProps {
  onChange: (value: string[]) => void;
}

