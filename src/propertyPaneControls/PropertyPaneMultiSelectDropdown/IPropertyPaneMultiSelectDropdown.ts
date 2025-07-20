import { IPropertyPaneCustomFieldProps } from '@microsoft/sp-property-pane';
import { IDropdownOption } from '@fluentui/react/lib/Dropdown';

export interface IPropertyPaneMultiSelectDropdownProps {
  label: string;
  options: IDropdownOption[];
  selectedKeys: string[];
  onPropertyChange: (propertyPath: string, newValue: string[]) => void;
  key: string;
}

export interface IPropertyPaneMultiSelectDropdownInternalProps extends IPropertyPaneMultiSelectDropdownProps, IPropertyPaneCustomFieldProps {}
