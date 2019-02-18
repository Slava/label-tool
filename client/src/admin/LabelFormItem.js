import React from 'react';
import {
  Form,
  Input,
  Icon,
  Button,
  Checkbox,
  Radio,
  Header,
} from 'semantic-ui-react';

import { sortableHandle } from 'react-sortable-hoc';

import update from 'immutability-helper';

function renderExtraConfig({ value, onChange }) {
  if (value.type === 'text') {
    return (
      <Input
        label="Input box prompt"
        className="visible"
        placeholder="Ex.: 'car brand and model'"
        onChange={(e, data) =>
          onChange(value, { ...value, prompt: data.value })
        }
      />
    );
  }

  if (value.type === 'select' || value.type === 'select-one') {
    const options = value.options || [];
    const Comp = value.type === 'select' ? Checkbox : Radio;

    const renderedOptions = options.map((optionText, index) => (
      <div key={index} className="form-checkbox">
        <Comp />
        <Input
          value={optionText}
          size="small"
          onChange={(e, data) =>
            onChange(value, {
              ...value,
              options: update(options, { $splice: [[index, 1, data.value]] }),
            })
          }
        />
        <Button
          icon="trash"
          style={{ background: 'transparent' }}
          onClick={() =>
            onChange(value, {
              ...value,
              options: update(options, { $splice: [[index, 1]] }),
            })
          }
        />
      </div>
    ));

    return (
      <div>
        <Header as="h5">Options:</Header>
        {renderedOptions}
        <Button
          size="mini"
          circular
          icon="plus"
          onClick={() =>
            onChange(value, {
              ...value,
              options: update(options, { $push: ['Option'] }),
            })
          }
        />
      </div>
    );
  }
  return null;
}

export default function LabelFormItem({ value, onChange }) {
  const options = [
    { key: 'bbox', text: 'Draw a bounding box', value: 'bbox' },
    { key: 'polygon', text: 'Draw a polygon figure', value: 'polygon' },
    { key: 'text', text: 'Enter a text label', value: 'text' },
    { key: 'select', text: 'Select all tags that apply', value: 'select' },
    {
      key: 'select-one',
      text: 'Select one tag that applies',
      value: 'select-one',
    },
  ];

  const extraConfig = renderExtraConfig({ value, onChange });

  return (
    <div
      style={{
        marginTop: '0.7em',
        padding: '1em',
        border: 'solid 1px #efefef',
        background: 'white',
        shadow: 'rgb(204, 204, 204) 0px 1px 2px',
      }}
    >
      <Form className="form-card" style={{ display: 'flex' }}>
        <DragHandle style={{ flex: 0, marginTop: 9 }} />
        <div style={{ flex: 1, padding: '0 0.5em' }}>
          <Form.Field
            placeholder="Label name"
            control="input"
            defaultValue={value.name}
            style={{ padding: 3, fontSize: 24 }}
            onChange={e => onChange(value, { ...value, name: e.target.value })}
          />
          <Form.Select
            label="Label type"
            options={options}
            defaultValue={value.type}
            onChange={(e, change) =>
              onChange(value, { ...value, type: change.value })
            }
            style={{ maxWidth: 400 }}
          />
          {extraConfig}
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <Button
            style={{ background: 'transparent', padding: 0 }}
            onClick={() => onChange(value, null)}
          >
            <Icon name="trash" />
          </Button>
        </div>
      </Form>
    </div>
  );
}

const dragHandleStyle = {
  background:
    'linear-gradient(180deg,#000,#000 20%,#fff 0,#fff 40%,#000 0,#000 60%,#fff 0,#fff 80%,#000 0,#000)',
  width: 25,
  minWidth: 25,
  height: 20,
  opacity: 0.25,
  cursor: 'move',
};
const DragHandle = sortableHandle(({ style }) => (
  <div style={{ ...dragHandleStyle, ...style }} />
));
