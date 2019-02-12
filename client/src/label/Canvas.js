import React, { Component } from 'react';
import { CRS, LatLngBounds } from 'leaflet';
import { Map, ImageOverlay } from 'react-leaflet';
import Hotkeys from 'react-hot-keys';
import update from 'immutability-helper';
import 'leaflet-path-drag';

import 'leaflet/dist/leaflet.css';

import { BBoxFigure, PolygonFigure } from './Figure';

const maxZoom = 7;
let imgRef = new Image();
export default class Canvas extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      lastColor: null,
      bounds: null,
      zoom: -1,
      height: null,
      width: null,
      // state: editing/drawing is derived from the props.color
      unfinishedFigure: null,
      selectedFigure: null,
      cursorPos: { lat: 0, lng: 0 },
    };
    this.prevSelectedFigure = null;
    this.skipNextClickEvent = false;

    this.mapRef = React.createRef();
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.calcBounds(this.props.url);
  }

  componentDidUpdate(prevProps) {
    const { url, onSelectionChange } = this.props;
    const { selectedFigure } = this.state;

    if (url !== prevProps.url) {
      this.calcBounds(url);
    }

    if (this.prevSelectedFigure !== selectedFigure && onSelectionChange) {
      this.prevSelectedFigure = selectedFigure;
      onSelectionChange(selectedFigure);
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.color !== state.lastColor && props.color) {
      return {
        unfinishedFigure: {
          id: null,
          color: props.color,
          type: props.type,
          points: [],
        },
        lastColor: props.color,
      };
    }

    return {
      lastColor: props.color,
    };
  }

  calcBounds(url) {
    const crs = CRS.Simple;
    imgRef.src = url;
    imgRef.onload = () => {
      const { height, width } = imgRef;
      const southWest = crs.unproject({ x: 0, y: imgRef.height }, maxZoom - 1);
      const northEast = crs.unproject({ x: imgRef.width, y: 0 }, maxZoom - 1);
      const bounds = new LatLngBounds(southWest, northEast);

      this.setState({ bounds, height, width });
    };
  }

  getSelectedFigure() {
    const { selectedFigure } = this.state;
    return selectedFigure;
  }

  handleChange(eventType, { point, pos, figure, points }) {
    const { unfinishedFigure } = this.state;
    const { onChange, color } = this.props;
    const drawing = !!color;

    switch (eventType) {
      case 'add':
        if (drawing) {
          let newState = unfinishedFigure.points;
          newState = update(newState, { $push: [point] });

          this.setState(
            {
              unfinishedFigure: update(unfinishedFigure, {
                points: {
                  $set: newState,
                },
              }),
            },
            () => {
              const { unfinishedFigure } = this.state;
              if (
                unfinishedFigure.type === 'bbox' &&
                unfinishedFigure.points.length >= 2
              ) {
                this.handleChange('end', {});
              }
            }
          );
        } else {
          onChange(
            'replace',
            update(figure, { points: { $splice: [[pos, 0, point]] } })
          );
        }
        break;

      case 'end':
        const f = unfinishedFigure;
        onChange('new', f);
        this.setState({
          unfinishedFigure: null,
        });
        break;

      case 'move':
        onChange(
          'replace',
          update(figure, { points: { $splice: [[pos, 1, point]] } })
        );
        break;

      case 'replace':
        onChange('replace', update(figure, { points: { $set: points } }));
        break;

      case 'remove':
        onChange(
          'replace',
          update(figure, { points: { $splice: [[pos, 1]] } })
        );
        break;

      default:
        throw new Error('unknown event type ' + eventType);
    }
  }

  handleClick(e) {
    const { color } = this.props;
    const drawing = !!color;

    if (this.skipNextClickEvent) {
      // a hack, for whatever reason it is really hard to stop event propagation in leaflet
      this.skipNextClickEvent = false;
      return;
    }

    if (drawing) {
      this.handleChange('add', { point: convertPoint(e.latlng) });
      return;
    }

    if (!drawing) {
      this.setState({ selectedFigure: null });
      return;
    }
  }

  renderFigure(figure, options) {
    const Comp = figure.type === 'bbox' ? BBoxFigure : PolygonFigure;
    return (
      <Comp
        key={figure.id}
        figure={figure}
        options={options}
        skipNextClick={() => (this.skipNextClickEvent = true)}
      />
    );
  }

  render() {
    const { url, color, figures, onChange, onReassignment, style } = this.props;
    const {
      bounds,
      zoom,
      height,
      width,
      unfinishedFigure,
      selectedFigure,
      cursorPos,
    } = this.state;

    const drawing = !!color;

    if (!bounds) {
      return null;
    }

    const calcDistance = (p1, p2) => {
      const map = this.mapRef.current.leafletElement;
      return map.latLngToLayerPoint(p1).distanceTo(map.latLngToLayerPoint(p2));
    };

    const unfinishedDrawingDOM = drawing
      ? this.renderFigure(unfinishedFigure, {
          finished: false,
          editing: false,
          interactive: false,
          onChange: this.handleChange,
          calcDistance,
          newPoint: cursorPos,
        })
      : null;

    const figuresDOM = figures.map((f, i) =>
      this.renderFigure(f, {
        editing: selectedFigure && selectedFigure.id === f.id && !drawing,
        finished: true,
        interactive: !drawing,
        onSelect: () => this.setState({ selectedFigure: f }),
        onChange: this.handleChange,
        calcDistance,
      })
    );

    const hotkeysDOM = (
      <Hotkeys
        keyName="backspace,del,c,f"
        onKeyDown={key => {
          if (drawing) {
            if (key === 'f') {
              if (
                unfinishedFigure.type === 'polygon' &&
                unfinishedFigure.points.length >= 3
              ) {
                this.handleChange('end', {});
              }
            }
          } else {
            if (key === 'c') {
              if (selectedFigure) {
                onReassignment(selectedFigure.type);
              }
            } else if (key === 'backspace' || key === 'del') {
              if (selectedFigure) {
                onChange('delete', selectedFigure);
              }
            }
          }
        }}
      />
    );

    return (
      <div
        style={{
          cursor: drawing ? 'crosshair' : 'grab',
          height: '100%',
          ...style,
        }}
      >
        <Map
          crs={CRS.Simple}
          zoom={zoom}
          minZoom={-50}
          maxZoom={maxZoom}
          center={[height / 2, width / 2]}
          zoomAnimation={false}
          zoomSnap={0.1}
          keyboard={false}
          attributionControl={false}
          onClick={this.handleClick}
          onZoom={e => this.setState({ zoom: e.target.getZoom() })}
          onMousemove={e => this.setState({ cursorPos: e.latlng })}
          ref={this.mapRef}
        >
          <ImageOverlay url={url} bounds={bounds} />
          {unfinishedDrawingDOM}
          {figuresDOM}
          {hotkeysDOM}
        </Map>
      </div>
    );
  }
}

function convertPoint(p) {
  return {
    lat: p.lat,
    lng: p.lng,
  };
}
