import React, { Component } from 'react';
import { Header, List, Label, Icon, Segment, Table } from 'semantic-ui-react';
import Hotkeys from 'react-hot-keys';
import update from 'immutability-helper';

import 'semantic-ui-css/semantic.min.css';

import Canvas from './Canvas';
import './App.css';

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

const labels = [
  { name: 'cat', type: 'bbox' },
  { name: 'dog', type: 'bbox' },
  { name: 'car', type: 'polygon' },
  { name: 'tree', type: 'polygon' },
  { name: 'house', type: 'bbox' },
  { name: 'person', type: 'polygon' },
];

function ListItem({
  shortcut,
  label,
  onSelect,
  onToggle,
  color,
  selected = false,
  isToggled,
}) {
  const icon = onToggle ? (
    <Icon
      link
      name={isToggled ? 'eye' : 'eye slash'}
      style={{ float: 'right' }}
      onClick={e => {
        onToggle(label);
        e.stopPropagation();
      }}
    />
  ) : null;

  return (
    <List.Item onClick={onSelect} active={selected} key={label}>
      <Hotkeys keyName={shortcut} onKeyDown={onSelect}>
        <Label color={color} horizontal>
          {shortcut}
        </Label>
        {label}
        {icon}
      </Hotkeys>
    </List.Item>
  );
}

/*
 type Figure = {
   type: 'bbox' | 'polygon';
   points: [{ lat: Number, lng: Number }];
   ?color: Color;
 };
*/

class App extends Component {
  constructor(props) {
    super(props);

    const figures = {};
    const toggles = {};
    labels.map(label => (figures[label.name] = []));
    labels.map(label => (toggles[label.name] = true));
    this.state = {
      selected: null,
      figures, // mapping from label name to a list of Figure structures
      toggles,

      // UI
      reassigning: false,
      hotkeysPanel: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.canvasRef = React.createRef();
  }

  handleChange(eventType, figure) {
    if (!figure.color) return;
    const label = labels[colors.indexOf(figure.color)];
    const { figures } = this.state;
    const idx = figures[label.name].findIndex(f => f.id === figure.id);

    switch (eventType) {
      case 'new':
        this.setState(state => ({
          figures: update(state.figures, {
            [label.name]: {
              $push: [{ id: figure.id || genId(), points: figure.points }],
            },
          }),
          selected: null, // deselect the label after the figure is finished
        }));
        break;

      case 'replace':
        this.setState(state => ({
          figures: update(state.figures, {
            [label.name]: {
              $splice: [[idx, 1, { id: figure.id, points: figure.points }]],
            },
          }),
        }));
        break;

      case 'delete':
        this.setState(state => ({
          figures: update(state.figures, {
            [label.name]: {
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
    const {
      figures,
      selected,
      reassigning,
      toggles,
      hotkeysPanel,
    } = this.state;
    const allFigures = [];
    labels.map((label, i) =>
      figures[label.name].map(
        poly =>
          toggles[label.name] &&
          allFigures.push({
            color: colors[i],
            points: poly.points,
            id: poly.id,
          })
      )
    );

    const sidebarProps = reassigning
      ? {
          title: 'Select the new label',
          selected: null,
          onSelect: selected => {
            const figure = this.canvasRef.current.getSelectedFigure();
            const newColor =
              colors[labels.findIndex(label => label.name === selected)];
            if (figure && figure.color !== newColor) {
              this.handleChange('delete', figure);
              figure.color = newColor;
              this.handleChange('new', figure);
            }

            this.setState({ reassigning: false });
          },
        }
      : {
          title: 'Labeling',
          selected,
          onSelect: selected => this.setState({ selected }),
          toggles,
          onToggle: labelName =>
            this.setState({
              toggles: update(toggles, {
                [labelName]: { $set: !toggles[labelName] },
              }),
            }),
          openHotkeys: () => this.setState({ hotkeysPanel: true }),
        };

    const hotkeysPanelDOM = hotkeysPanel ? (
      <HotkeysPanel
        labels={labels.map(label => label.name)}
        onClose={() => this.setState({ hotkeysPanel: false })}
      />
    ) : null;

    return (
      <div style={{ display: 'flex' }}>
        <Sidebar
          labels={labels.map(label => label.name)}
          {...sidebarProps}
          style={{ flex: 1, maxWidth: 300 }}
        />
        {hotkeysPanelDOM}
        <Canvas
          url="http://kempe.net/images/newspaper-big.jpg"
          figures={allFigures}
          color={
            selected
              ? colors[labels.findIndex(label => label.name === selected)]
              : null
          }
          onChange={this.handleChange}
          onReassignment={() => this.setState({ reassigning: true })}
          onSelectionChange={figure =>
            figure || this.setState({ reassigning: false })
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
      style,
      openHotkeys,
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
      <div style={{ padding: '1em 0.5em', ...style }}>
        <Header size="large">
          {title}
          {hotkeysButton}
        </Header>
        <List divided selection>
          {labels.map((label, i) =>
            ListItem({
              shortcut: shortcuts[i],
              label,
              color: colors[i],
              onSelect: () => onSelect(label),
              selected: selected === label,
              onToggle: onToggle,
              isToggled: toggles && toggles[label],
            })
          )}
          <Hotkeys keyName="esc" onKeyDown={() => onSelect(null)} />
        </List>
      </div>
    );
  }
}

function HotkeysPanel({ labels, onClose }) {
  return (
    <div style={{ height: '100vh' }}>
      <Header as="h2" attached="top">
        Hotkeys
        <Icon link name="close" style={headerIconStyle} onClick={onClose} />
      </Header>
      <Segment attached style={{ height: '100%' }}>
        <Header as="h3"> Labels </Header>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Action</Table.HeaderCell>
              <Table.HeaderCell>Key</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {labels.map((label, i) => (
              <Table.Row key={label}>
                <Table.Cell>{label}</Table.Cell>
                <Table.Cell>{i}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <Header as="h3"> General </Header>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Action</Table.HeaderCell>
              <Table.HeaderCell>Key</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            <Table.Row>
              <Table.Cell>Complete shape</Table.Cell>
              <Table.Cell>f</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Change label</Table.Cell>
              <Table.Cell>c</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Delete figure</Table.Cell>
              <Table.Cell>Delete</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Cancel selection</Table.Cell>
              <Table.Cell>Escape</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </Segment>
    </div>
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

export default App;
