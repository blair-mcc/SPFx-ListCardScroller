import * as React from 'react';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';

export interface IPropertyPaneMultiSelectDropdownHostProps {
  label: string;
  options: IDropdownOption[];
  selectedKeys: string[];
  onChange: (selected: string[]) => void;
}

const PropertyPaneMultiSelectDropdownHost: React.FC<IPropertyPaneMultiSelectDropdownHostProps> = ({
  label,
  options,
  selectedKeys,
  onChange
}) => {
  const [selected, setSelected] = React.useState<string[]>(selectedKeys || []);

  const handleChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
    let newSelection: string[];

    if (item.selected) {
      newSelection = [...selected, item.key as string];
    } else {
      newSelection = selected.filter(key => key !== item.key);
    }

    setSelected(newSelection);
    onChange(newSelection); // ✅ send back to the Web Part
  };

  return (
    <Dropdown
      label={label}
      multiSelect
      options={options}
      selectedKeys={selected}
      onChange={handleChange}
    />
  );
};

export default PropertyPaneMultiSelectDropdownHost;
