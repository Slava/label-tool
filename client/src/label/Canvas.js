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
      bounds: null,
      zoom: -1,
      height: null,
      width: null,
      selectedFigureId: null,
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
    const { selectedFigureId } = this.state;

    if (url !== prevProps.url) {
      this.calcBounds(url);
    }

    if (this.prevSelectedFigureId !== selectedFigureId && onSelectionChange) {
      this.prevSelectedFigureId = selectedFigureId;
      onSelectionChange(selectedFigureId);
    }
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
    const { selectedFigureId } = this.state;
    const { figures } = this.props;
    return figures.find(f => f.id === selectedFigureId);
  }

  handleChange(eventType, { point, pos, figure, points }) {
    const { onChange, unfinishedFigure } = this.props;
    const drawing = !!unfinishedFigure;

    switch (eventType) {
      case 'add':
        if (drawing) {
          let newState = unfinishedFigure.points;
          newState = update(newState, { $push: [point] });

          onChange(
            'unfinished',
            update(unfinishedFigure, {
              points: {
                $set: newState,
              },
            })
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
    const { unfinishedFigure } = this.props;
    const drawing = !!unfinishedFigure;

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
      this.setState({ selectedFigureId: null });
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
    const {
      url,
      figures,
      unfinishedFigure,
      onChange,
      onReassignment,
      style,
    } = this.props;
    const {
      bounds,
      zoom,
      height,
      width,
      selectedFigureId,
      cursorPos,
    } = this.state;

    const drawing = !!unfinishedFigure;

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
        editing: selectedFigureId === f.id && !drawing,
        finished: true,
        interactive: !drawing,
        onSelect: () => this.setState({ selectedFigureId: f.id }),
        onChange: this.handleChange,
        calcDistance,
      })
    );

    const hotkeysDOM = (
      <Hotkeys
        keyName="backspace,del,c,f,-,=,left,right,up,down"
        onKeyDown={key => {
          if (drawing) {
            if (key === 'f') {
              const { type, points } = unfinishedFigure;
              if (type === 'polygon' && points.length >= 3) {
                this.handleChange('end', {});
              }
            }
          } else {
            if (key === 'c') {
              if (selectedFigureId) {
                onReassignment(this.getSelectedFigure().type);
              }
            } else if (key === 'backspace' || key === 'del') {
              if (selectedFigureId) {
                onChange('delete', this.getSelectedFigure());
              }
            }
          }

          const map = this.mapRef.current.leafletElement;
          if (key === 'left') {
            map.panBy([80, 0]);
          }
          if (key === 'right') {
            map.panBy([-80, 0]);
          }
          if (key === 'up') {
            map.panBy([0, 80]);
          }
          if (key === 'down') {
            map.panBy([0, -80]);
          }
          if (key === '=') {
            map.setZoom(map.getZoom() + 1);
          }
          if (key === '-') {
            map.setZoom(map.getZoom() - 1);
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
