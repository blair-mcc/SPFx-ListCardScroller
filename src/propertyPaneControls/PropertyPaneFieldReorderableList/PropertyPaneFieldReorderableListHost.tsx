import * as React from 'react';
import {
  Checkbox,
  Stack,
  Text,
  IconButton
} from '@fluentui/react';
import { IDropdownOption } from '@fluentui/react/lib/Dropdown';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from 'react-beautiful-dnd';

export interface IReorderableListHostProps {
  label: string;
  options: IDropdownOption[];
  selectedKeys: string[];
  onChange: (updatedKeys: string[]) => void;
}

const PropertyPaneFieldReorderableListHost: React.FC<IReorderableListHostProps> = ({
  label,
  options,
  selectedKeys,
  onChange
}) => {
  const [selected, setSelected] = React.useState<string[]>(selectedKeys);

  // Toggle checkbox selection
  const toggleField = (key: string): void => {
    const updated = selected.includes(key)
      ? selected.filter(k => k !== key)
      : [...selected, key];
    setSelected(updated);
    onChange(updated);
  };

  // Reorder after drag
  const onDragEnd = (result: DropResult): void => {
    if (!result.destination) return;

    const reordered = Array.from(selected);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    setSelected(reordered);
    onChange(reordered);
  };

  return (
    <div>
      <Text variant="mediumPlus" style={{ fontWeight: 600, marginBottom: 8 }}>
        {label}
      </Text>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="description-fields">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {selected.map((key, index) => {
                const option = options.find(o => o.key === key);
                if (!option) return null;

                return (
                  <Draggable key={key} draggableId={key} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          marginBottom: 8
                        }}
                      >
                        <Stack
                          horizontal
                          verticalAlign="center"
                          tokens={{ childrenGap: 6 }}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: '#f3f2f1',
                            borderRadius: 4
                          }}
                        >
                          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }} style={{ flexGrow: 1 }}>
                            <Text>{index + 1}.</Text>
                            <Text>{option.text}</Text>
                        </Stack>

                          <IconButton
                            iconProps={{ iconName: 'Cancel' }}
                            title="Remove"
                            ariaLabel="Remove"
                            onClick={() => toggleField(key)}
                          />
                        </Stack>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Text variant="smallPlus" style={{ marginTop: 12 }}>
        Add fields:
      </Text>

      <Stack tokens={{ childrenGap: 4 }} style={{ marginTop: 6 }}>
        {options
          .filter(o => !selected.includes(o.key as string))
          .map(opt => (
            <Checkbox
              key={opt.key as string}
              label={opt.text}
              checked={false}
              onChange={() => toggleField(opt.key as string)}
            />
          ))}
      </Stack>
    </div>
  );
};

export default PropertyPaneFieldReorderableListHost;
