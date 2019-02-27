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

import { computePath } from '../image-processing/LiveWire';
import { LineUtil } from 'leaflet';

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
      toggles,

      // Data
      figures, // mapping from label name to a list of Figure structures
      unfinishedFigure: null,
      figuresHistory: [],
      unfinishedFigureHistory: [],

      // Selection algorithm
      imageData: null,

      // UI
      reassigning: { status: false, type: null },
      hotkeysPanel: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSelected = this.handleSelected.bind(this);
    this.pushState = this.pushState.bind(this);
    this.popState = this.popState.bind(this);
    this.canvasRef = React.createRef();

    this.componentDidUpdate({}, this.state);
  }

  componentDidUpdate(prevProps, prevState) {
    const { onLabelChange, imageUrl } = this.props;
    const { figures, height, width } = this.state;

    if (figures !== prevState.figures) {
      onLabelChange({
        labels: figures,
        height,
        width,
      });
    }

    if (imageUrl !== prevProps.imageUrl) {
      const img = new Image();
      const setState = this.setState.bind(this);
      img.onload = async function() {
        const { height, width } = this;
        setState({ height, width });

        const resetImage = () => {
          const canvas = document.getElementById('test-canvas');
          const ctx = canvas.getContext('2d');
          canvas.height = height;
          canvas.width = width;
          ctx.drawImage(img, 0, 0, width, height);
          const data = ctx.getImageData(0, 0, width, height).data;
          setState({ imageData: data });
        };

        if (document.readyState === 'complete') {
          resetImage();
        } else {
          document.addEventListener('load', resetImage);
        }
      };
      img.src = imageUrl;
    }
  }

  pushState(stateChange, cb) {
    this.setState(
      state => ({
        figuresHistory: update(state.figuresHistory, {
          $push: [state.figures],
        }),
        unfinishedFigureHistory: update(state.unfinishedFigureHistory, {
          $push: [state.unfinishedFigure],
        }),
        ...stateChange(state),
      }),
      cb
    );
  }

  popState() {
    this.setState(state => {
      let { figuresHistory, unfinishedFigureHistory } = state;
      if (!figuresHistory.length) {
        return {};
      }

      figuresHistory = figuresHistory.slice();
      unfinishedFigureHistory = unfinishedFigureHistory.slice();
      const figures = figuresHistory.pop();
      let unfinishedFigure = unfinishedFigureHistory.pop();

      if (unfinishedFigure && !unfinishedFigure.points.length) {
        unfinishedFigure = null;
      }

      return {
        figures,
        unfinishedFigure,
        figuresHistory,
        unfinishedFigureHistory,
      };
    });
  }

  handleSelected(selected) {
    if (selected === this.state.selected) return;

    if (!selected) {
      this.pushState(state => ({
        selected,
        unfinishedFigure: null,
      }));
      return;
    }

    const { labels } = this.props;

    const labelIdx = labels.findIndex(label => label.id === selected);
    const type = labels[labelIdx].type;
    const color = colors[labelIdx];

    this.pushState(state => ({
      selected,
      unfinishedFigure: {
        id: null,
        color,
        type,
        points: [],
      },
    }));
  }

  handleChange(eventType, figure, newLabelId) {
    if (!figure.color) return;
    const { labels } = this.props;
    const label = labels[colors.indexOf(figure.color)];
    const { figures } = this.state;
    const idx = figures[label.id].findIndex(f => f.id === figure.id);

    switch (eventType) {
      case 'new':
        this.pushState(state => ({
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
          unfinishedFigure: null,
        }));
        break;

      case 'replace':
        this.pushState(state => {
          let { tracingOptions } = figure;
          if (tracingOptions && tracingOptions.enabled) {
            const { height, width, imageData } = state;
            const imageInfo = {
              height,
              width,
              imageData,
            };
            tracingOptions = {
              ...tracingOptions,
              trace: computeTrace(figure.points, imageInfo, tracingOptions),
            };
          } else {
            tracingOptions = { ...tracingOptions, trace: [] };
          }

          return {
            figures: update(state.figures, {
              [label.id]: {
                $splice: [
                  [
                    idx,
                    1,
                    {
                      id: figure.id,
                      type: figure.type,
                      points: figure.points,
                      tracingOptions,
                    },
                  ],
                ],
              },
            }),
          };
        });
        break;

      case 'delete':
        this.pushState(state => ({
          figures: update(state.figures, {
            [label.id]: {
              $splice: [[idx, 1]],
            },
          }),
        }));
        break;

      case 'unfinished':
        this.pushState(
          state => ({ unfinishedFigure: figure }),
          () => {
            const { unfinishedFigure } = this.state;
            const { type, points } = unfinishedFigure;
            if (type === 'bbox' && points.length >= 2) {
              this.handleChange('new', unfinishedFigure);
            }
          }
        );
        break;

      case 'recolor':
        if (label.id === newLabelId) return;
        this.pushState(state => ({
          figures: update(state.figures, {
            [label.id]: {
              $splice: [[idx, 1]],
            },
            [newLabelId]: {
              $push: [
                {
                  id: figure.id,
                  points: figure.points,
                  type: figure.type,
                  tracingOptions: figure.tracingOptions,
                },
              ],
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
      unfinishedFigure,
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
            tracingOptions: figure.tracingOptions,
          })
      )
    );

    const sidebarProps = reassigning.status
      ? {
          title: 'Select the new label',
          selected: null,
          onSelect: selected => {
            const figure = this.canvasRef.current.getSelectedFigure();
            if (figure) {
              this.handleChange('recolor', figure, selected);
            }

            this.setState({ reassigning: { status: false, type: null } });
          },
          filter: label => label.type === reassigning.type,
          labelData: figures,
        }
      : {
          title: 'Labeling',
          selected,
          onSelect: this.handleSelected,
          toggles,
          onToggle: label =>
            this.setState({
              toggles: update(toggles, {
                [label.id]: { $set: !toggles[label.id] },
              }),
            }),
          openHotkeys: () => this.setState({ hotkeysPanel: true }),
          onFormChange: (labelId, newValue) =>
            this.pushState(state => ({
              figures: update(figures, { [labelId]: { $set: newValue } }),
            })),
          labelData: figures,
        };

    const hotkeysPanelDOM = hotkeysPanel ? (
      <HotkeysPanel
        labels={labels.map(label => label.name)}
        onClose={() => this.setState({ hotkeysPanel: false })}
      />
    ) : null;

    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <Hotkeys keyName="ctrl+z" onKeyDown={this.popState}>
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
            unfinishedFigure={unfinishedFigure}
            onChange={this.handleChange}
            onReassignment={type =>
              this.setState({ reassigning: { status: true, type } })
            }
            onSelectionChange={figureId =>
              figureId ||
              this.setState({ reassigning: { status: false, type: null } })
            }
            ref={this.canvasRef}
            style={{ flex: 4 }}
          />
        </Hotkeys>
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
          borderRight: '1px solid #ccc',
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

function computeTrace(
  points,
  { height, width, imageData },
  { smoothing, precision }
) {
  points = points.slice();
  points.push(points[0]);
  const path = computePath({
    points: points.map(({ lng, lat }) => ({
      x: lng,
      y: lat,
    })),
    height,
    width,
    imageData,
    markRadius: precision,
  });
  const simplePath = LineUtil.simplify(path, smoothing || 0.6);
  return simplePath.map(({ x, y }) => ({ lng: x, lat: y }));
}

export default LabelingApp;
