import React, { Component } from 'react';
import {
  Header,
  List,
  Label,
  Icon,
  Segment,
  Table,
  Loader,
  Button,
} from 'semantic-ui-react';
import Hotkeys from 'react-hot-keys';
import update from 'immutability-helper';

import 'semantic-ui-css/semantic.min.css';

import Canvas from './Canvas';
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

    const { labels } = props;
    const figures = {};
    const toggles = {};
    labels.map(label => (figures[label.name] = []));
    labels.map(label => (toggles[label.name] = true));
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

  handleChange(eventType, figure) {
    if (!figure.color) return;
    const { labels } = this.props;
    const label = labels[colors.indexOf(figure.color)];
    const { figures } = this.state;
    const idx = figures[label.name].findIndex(f => f.id === figure.id);

    switch (eventType) {
      case 'new':
        this.setState(state => ({
          figures: update(state.figures, {
            [label.name]: {
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
            [label.name]: {
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
    const { labels, imageUrl } = this.props;
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
        figure =>
          toggles[label.name] &&
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
              colors[labels.findIndex(label => label.name === selected)];
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
                [label.name]: { $set: !toggles[label.name] },
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

    const labelIdx = labels.findIndex(label => label.name === selected);
    const color = selected ? colors[labelIdx] : null;
    const type = selected ? labels[labelIdx].type : null;

    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <Sidebar
          labels={labels}
          {...sidebarProps}
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
              onSelect: () => onSelect(label.name),
              selected: selected === label.name,
              disabled: filter ? !filter(label) : false,
              onToggle: onToggle,
              isToggled: toggles && toggles[label.name],
            })
          )}
          <Hotkeys keyName="esc" onKeyDown={() => onSelect(null)} />
        </List>
        <div style={{ flex: '0 0 auto', display: 'flex' }}>
          <Button>Back</Button>
          <span style={{ flex: 1 }} />
          <Button secondary>Skip</Button>
          <Button primary>Submit</Button>
        </div>
      </div>
    );
  }
}

function ListItem({
  shortcut,
  label,
  onSelect,
  onToggle,
  color,
  selected = false,
  disabled = false,
  isToggled = false,
}) {
  const icons = [];

  const iconType =
    label.type === 'bbox' ? 'object ungroup outline' : 'pencil alternate';
  icons.push(<Icon key="type-icon" name={iconType} style={{ opacity: 0.5 }} />);
  if (onToggle) {
    icons.push(
      <Icon
        key="visibility-icon"
        link
        name={isToggled ? 'eye' : 'eye slash'}
        onClick={e => {
          onToggle(label);
          e.stopPropagation();
        }}
      />
    );
  }

  return (
    <List.Item
      onClick={onSelect}
      disabled={disabled}
      active={selected}
      key={label.name}
      style={{ fontSize: '1.3em' }}
    >
      <Hotkeys keyName={shortcut} onKeyDown={() => !disabled && onSelect()}>
        <Label color={color} horizontal>
          {shortcut}
        </Label>
        {label.name}
        <span style={{ float: 'right' }}>{icons}</span>
      </Hotkeys>
    </List.Item>
  );
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

class LabelingAppWithFetching extends Component {
  constructor(props) {
    super(props);
    this.state = {
      project: null,
      image: null,
      isLoaded: false,
      error: null,
    };
  }

  async componentDidMount() {
    const { match } = this.props;
    const { projectId, imageId } = match.params;

    try {
      const projectPromise = fetch('/api/projects/' + projectId).then(x =>
        x.json()
      );
      const imagePromise = fetch('/api/images/' + imageId).then(x => x.json());

      const [project, image] = await Promise.all([
        projectPromise,
        imagePromise,
      ]);

      this.setState({
        isLoaded: true,
        project,
        image,
      });
    } catch (error) {
      this.setState({
        isLoaded: true,
        error,
      });
    }
  }

  render() {
    const { project, image, isLoaded, error } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <Loader active inline="centered" />;
    }

    return (
      <LabelingApp labels={project.form.formParts} imageUrl={image.link} />
    );
  }
}

export default LabelingAppWithFetching;
