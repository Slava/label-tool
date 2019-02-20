import React, { Component } from 'react';
import {
  Header,
  List,
  Label,
  Icon,
  Button,
  Input,
  Checkbox,
  Radio,
} from 'semantic-ui-react';
import Hotkeys from 'react-hot-keys';
import update from 'immutability-helper';

import 'semantic-ui-css/semantic.min.css';

import Canvas from './Canvas';
import HotkeysPanel from './HotkeysPanel';
import './LabelingApp.css';

const shortcuts = '1234567890qwe';
const colors = [
  'red',
  'blue',
  'green',
  'violet',
  'orange',
  'brown',
  'yellow',
  'olive',
  'teal',
  'purple',
  'pink',
  'grey',
  'black',
];

/*
 type Figure = {
   type: 'bbox' | 'polygon';
   points: [{ lat: Number, lng: Number }];
   ?color: Color;
 };
*/

class LabelingApp extends Component {
  constructor(props) {
    super(props);

    const { labels, labelData } = props;
    const figures = {};
    const toggles = {};
    labels.map(label => (figures[label.id] = []));
    labels.map(label => (toggles[label.id] = true));

    Object.keys(labelData).forEach(key => {
      figures[key] = (figures[key] || []).concat(labelData[key]);
    });

    this.state = {
      selected: null,
      figures, // mapping from label name to a list of Figure structures
      toggles,

      // UI
      reassigning: { status: false, type: null },
      hotkeysPanel: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.canvasRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState) {
    const { onLabelChange, imageUrl } = this.props;
    const { figures } = this.state;
    if (figures !== prevState.figures) {
      const img = new Image();
      img.onload = function() {
        const { height, width } = this;
        onLabelChange({
          labels: figures,
          height,
          width,
        });
      };
      img.src = imageUrl;
    }
  }

  handleChange(eventType, figure) {
    if (!figure.color) return;
    const { labels } = this.props;
    const label = labels[colors.indexOf(figure.color)];
    const { figures } = this.state;
    const idx = figures[label.id].findIndex(f => f.id === figure.id);

    switch (eventType) {
      case 'new':
        this.setState(state => ({
          figures: update(state.figures, {
            [label.id]: {
              $push: [
                {
                  id: figure.id || genId(),
                  type: figure.type,
                  points: figure.points,
                },
              ],
            },
          }),
          selected: null, // deselect the label after the figure is finished
        }));
        break;

      case 'replace':
        this.setState(state => ({
          figures: update(state.figures, {
            [label.id]: {
              $splice: [
                [
                  idx,
                  1,
                  { id: figure.id, type: figure.type, points: figure.points },
                ],
              ],
            },
          }),
        }));
        break;

      case 'delete':
        this.setState(state => ({
          figures: update(state.figures, {
            [label.id]: {
              $splice: [[idx, 1]],
            },
          }),
        }));
        break;

      default:
        throw new Error('unknown event type ' + eventType);
    }
  }

  render() {
    const { labels, imageUrl, onBack, onSkip, onSubmit } = this.props;
    const {
      figures,
      selected,
      reassigning,
      toggles,
      hotkeysPanel,
    } = this.state;

    const forwardedProps = {
      onBack,
      onSkip,
      onSubmit,
    };

    const allFigures = [];
    labels.map((label, i) =>
      figures[label.id].map(
        figure =>
          toggles[label.id] &&
          (label.type === 'bbox' || label.type === 'polygon') &&
          allFigures.push({
            color: colors[i],
            points: figure.points,
            id: figure.id,
            type: figure.type,
          })
      )
    );

    const sidebarProps = reassigning.status
      ? {
          title: 'Select the new label',
          selected: null,
          onSelect: selected => {
            const figure = this.canvasRef.current.getSelectedFigure();
            const newColor =
              colors[labels.findIndex(label => label.id === selected)];
            if (figure && figure.color !== newColor) {
              this.handleChange('delete', figure);
              figure.color = newColor;
              this.handleChange('new', figure);
            }

            this.setState({ reassigning: { status: false, type: null } });
          },
          filter: label => label.type === reassigning.type,
        }
      : {
          title: 'Labeling',
          selected,
          onSelect: selected => this.setState({ selected }),
          toggles,
          onToggle: label =>
            this.setState({
              toggles: update(toggles, {
                [label.id]: { $set: !toggles[label.id] },
              }),
            }),
          openHotkeys: () => this.setState({ hotkeysPanel: true }),
          onFormChange: (labelId, newValue) =>
            this.setState({
              figures: update(figures, { [labelId]: { $set: newValue } }),
            }),
          labelData: figures,
        };

    const hotkeysPanelDOM = hotkeysPanel ? (
      <HotkeysPanel
        labels={labels.map(label => label.name)}
        onClose={() => this.setState({ hotkeysPanel: false })}
      />
    ) : null;

    const labelIdx = labels.findIndex(label => label.id === selected);
    const type = selected ? labels[labelIdx].type : null;
    const color =
      selected && (type === 'bbox' || type === 'polygon')
        ? colors[labelIdx]
        : null;

    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <Sidebar
          labels={labels}
          {...sidebarProps}
          {...forwardedProps}
          style={{ flex: 1, maxWidth: 300 }}
        />
        {hotkeysPanelDOM}
        <Canvas
          url={imageUrl}
          figures={allFigures}
          color={color}
          type={type}
          onChange={this.handleChange}
          onReassignment={type =>
            this.setState({ reassigning: { status: true, type } })
          }
          onSelectionChange={figure =>
            figure ||
            this.setState({ reassigning: { status: false, type: null } })
          }
          ref={this.canvasRef}
          style={{ flex: 4 }}
        />
      </div>
    );
  }
}

const headerIconStyle = { fontSize: '0.8em', float: 'right' };
class Sidebar extends Component {
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
    } = this.props;

    const hotkeysButton = openHotkeys ? (
      <Icon
        link
        name="keyboard"
        style={headerIconStyle}
        onClick={openHotkeys}
      />
    ) : null;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '1em 0.5em',
          ...style,
        }}
      >
        <Header size="large" style={{ flex: '0 0 auto' }}>
          {title}
          {hotkeysButton}
        </Header>
        <List divided selection style={{ flex: 1 }}>
          {labels.map((label, i) =>
            ListItem({
              shortcut: shortcuts[i],
              label,
              color: colors[i],
              onSelect: () => onSelect(label.id),
              selected: selected === label.id,
              disabled: filter ? !filter(label) : false,
              onToggle: onToggle,
              isToggled: toggles && toggles[label.id],
              labelData: labelData[label.id],
              onFormChange,
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
      return (
        <List style={sublistStyle}>
          <List.Item>
            <Input
              label={label.prompt}
              style={{ width: '100%' }}
              value={labelData[0] || ''}
              onChange={(e, { value }) => onFormChange(label.id, [value])}
            />
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
      <Hotkeys keyName={shortcut} onKeyDown={() => !disabled && onSelect()}>
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

function genId() {
  return (
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15)
  );
}

export default LabelingApp;
