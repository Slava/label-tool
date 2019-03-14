import React, { PureComponent } from 'react';
import {
  Header,
  List,
  Label,
  Icon,
  Button,
  Form,
  Checkbox,
  Radio,
  Select,
} from 'semantic-ui-react';
import { shortcuts, colors } from './utils';
import Hotkeys from 'react-hot-keys';

const headerIconStyle = { fontSize: '0.8em', float: 'right' };
export default class Sidebar extends PureComponent {
  render() {
    const {
      title,
      onSelect,
      labels,
      selected,
      toggles,
      onToggle,
      filter,
      style,
      openHotkeys,
      onBack,
      onSkip,
      onSubmit,
      labelData,
      onFormChange,
      models,
      makePrediction,
    } = this.props;

    const hotkeysButton = openHotkeys ? (
      <Icon
        link
        name="keyboard"
        style={headerIconStyle}
        onClick={openHotkeys}
      />
    ) : null;

    const getSelectHandler = ({ type, id }) =>
      type === 'bbox' || type === 'polygon' ? () => onSelect(id) : null;
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '1em 0.5em',
          borderRight: '1px solid #ccc',
          height: '100%',
          ...style,
        }}
      >
        <Header size="large" style={{ flex: '0 0 auto' }}>
          {title}
          {hotkeysButton}
        </Header>
        <List divided selection style={{ flex: 1, overflowY: 'auto' }}>
          {labels.map((label, i) =>
            ListItem({
              shortcut: shortcuts[i],
              label,
              color: colors[i],
              onSelect: getSelectHandler(label),
              selected: selected === label.id,
              disabled: filter ? !filter(label) : false,
              onToggle: onToggle,
              isToggled: toggles && toggles[label.id],
              labelData: labelData[label.id],
              onFormChange,
              models,
              makePrediction,
            })
          )}
          <Hotkeys keyName="esc" onKeyDown={() => onSelect(null)} />
        </List>
        <div style={{ flex: '0 0 auto', display: 'flex' }}>
          <Button onClick={onBack}>Back</Button>
          <span style={{ flex: 1 }} />
          <Button secondary onClick={onSkip}>
            Skip
          </Button>
          <Button primary onClick={onSubmit}>
            Submit
          </Button>
        </div>
      </div>
    );
  }
}

const iconMapping = {
  bbox: 'object ungroup outline',
  polygon: 'pencil alternate',
};

const typeHidable = {
  bbox: true,
  polygon: true,
  text: false,
  select: false,
  'select-one': false,
};
function ListItem({
  shortcut,
  label,
  onSelect,
  onToggle,
  color,
  selected = false,
  disabled = false,
  isToggled = false,
  labelData,
  onFormChange,
  models,
  makePrediction,
}) {
  const icons = [];

  if (onToggle && typeHidable[label.type]) {
    icons.push(
      <Button
        key="visibility-icon"
        icon={isToggled ? 'eye' : 'eye slash'}
        style={{ padding: 5 }}
        onClick={e => {
          onToggle(label);
          e.stopPropagation();
        }}
      />
    );
  }

  const iconType = iconMapping[label.type];
  const figureIcon = iconType ? (
    <Icon
      key="type-icon"
      name={iconType}
      style={{ opacity: 0.5, display: 'inline-block', marginLeft: 5 }}
    />
  ) : null;

  function genSublist(label) {
    const sublistStyle = { fontSize: '12px' };
    if (label.type === 'text') {
      const filteredModels = (models || []).filter(
        ({ type }) => type === 'object_classification'
      );
      const options = filteredModels.map(({ id, name }) => ({
        value: id,
        text: name,
      }));
      const fillInDOM =
        filteredModels.length > 0 ? (
          <div>
            Fill in using a model prediction:
            <Select
              options={options}
              placeholder="Select a model"
              onChange={async (e, { value }) => {
                const m = models.find(({ id }) => id === value);
                const text = (await makePrediction(m)).join(', ');
                onFormChange(label.id, [text]);
              }}
            />
          </div>
        ) : null;
      return (
        <List style={sublistStyle}>
          <List.Item>
            <Form>
              <Form.Input
                label={label.prompt}
                style={{ width: '100%' }}
                value={labelData[0] || ''}
                onChange={(e, { value }) => onFormChange(label.id, [value])}
              />
              {fillInDOM}
            </Form>
          </List.Item>
        </List>
      );
    }

    if (label.type === 'select') {
      const { options } = label;
      const handleChange = function(option) {
        return (e, { checked }) =>
          onFormChange(
            label.id,
            checked
              ? labelData.concat([option])
              : labelData.filter(x => x !== option)
          );
      };

      const items = options.map(option => (
        <List.Item key={option}>
          <Checkbox
            label={option}
            checked={labelData.indexOf(option) !== -1}
            onChange={handleChange(option)}
          />
        </List.Item>
      ));
      return <List style={sublistStyle}>{items}</List>;
    }

    if (label.type === 'select-one') {
      const { options } = label;
      const items = options.map(option => (
        <List.Item key={option}>
          <Radio
            label={option}
            checked={labelData.indexOf(option) !== -1}
            onChange={(e, { checked }) => onFormChange(label.id, [option])}
          />
        </List.Item>
      ));
      return <List style={sublistStyle}>{items}</List>;
    }

    return null;
  }

  return (
    <List.Item
      onClick={onSelect}
      disabled={disabled}
      active={selected}
      key={label.id}
      style={{ fontSize: '1.3em' }}
    >
      <Hotkeys
        keyName={shortcut}
        onKeyDown={() => !disabled && onSelect && onSelect()}
      >
        <Label color={color} horizontal>
          {shortcut}
        </Label>
        {label.name}
        {figureIcon}
        <span style={{ float: 'right' }}>{icons}</span>
        {genSublist(label)}
      </Hotkeys>
    </List.Item>
  );
}
