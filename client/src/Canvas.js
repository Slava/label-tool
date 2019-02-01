import React, { Component, Fragment } from 'react';
import { CRS, LatLngBounds } from 'leaflet';
import {
  Map,
  ImageOverlay,
  Polyline,
  Polygon,
  CircleMarker,
} from 'react-leaflet';
import Hotkeys from 'react-hot-keys';
import update from 'immutability-helper';
import 'leaflet-path-drag';

import 'leaflet/dist/leaflet.css';

const maxZoom = 7;
let imgRef = new Image();
let skipNextClickEvent = false;
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

    this.mapRef = React.createRef();
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.calcBounds(this.props.url);
  }

  componentDidUpdate(prevProps) {
    if (this.props.url !== prevProps.url) {
      this.calcBounds(this.props.url);
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.color !== state.lastColor && props.color) {
      return {
        unfinishedFigure: {
          id: null,
          color: props.color,
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

  handleChange(eventType, { point, pos, figure }) {
    const { unfinishedFigure } = this.state;
    const { onChange, color } = this.props;
    const drawing = !!color;

    switch (eventType) {
      case 'add':
        if (drawing) {
          let newState = unfinishedFigure.points;
          newState = update(newState, { $push: [point] });

          this.setState({
            unfinishedFigure: update(unfinishedFigure, {
              points: {
                $set: newState,
              },
            }),
          });
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

    if (skipNextClickEvent) {
      // a hack, for whatever reason it is really hard to stop event propagation in leaflet
      skipNextClickEvent = false;
      return;
    }

    if (drawing) {
      this.handleChange('add', { point: convertPoint(e.latlng) });
    }

    if (!drawing) {
      this.setState({ selectedFigure: null });
    }
  }

  render() {
    const {
      url,
      color,
      figures,
      onChange,
      onReassignment,
      onSelectionChange,
      style,
    } = this.props;
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

    if (this.prevSelectedFigure !== selectedFigure && onSelectionChange) {
      this.prevSelectedFigure = selectedFigure;
      onSelectionChange(selectedFigure);
    }

    const calcDistance = (p1, p2) => {
      const map = this.mapRef.current.leafletElement;
      return map.latLngToLayerPoint(p1).distanceTo(map.latLngToLayerPoint(p2));
    };

    const unfinishedDrawingDOM = drawing ? (
      <PolygonFigure
        figure={unfinishedFigure}
        options={{
          finished: false,
          editing: false,
          interactive: false,
          onChange: this.handleChange,
          calcDistance,
          newPoint: cursorPos,
        }}
      />
    ) : null;

    const figuresDOM = figures.map((f, i) => (
      <PolygonFigure
        key={f.id}
        figure={f}
        options={{
          editing: selectedFigure && selectedFigure.id === f.id && !drawing,
          finished: true,
          interactive: !drawing,
          onSelect: () => this.setState({ selectedFigure: f }),
          onChange: this.handleChange,
          calcDistance,
        }}
      />
    ));

    const hotkeysDOM = (
      <Hotkeys
        keyName="backspace,del,c,f"
        onKeyDown={key => {
          if (drawing) {
            if (key === 'f') {
              if (unfinishedFigure.points.length >= 3) {
                this.handleChange('end', {});
              }
            }
          } else {
            if (key === 'c') {
              if (selectedFigure) {
                onReassignment();
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

class Figure extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dragging: false,
      draggedPoint: null,
    };
  }
  // abstract
  calculateGuides() {
    return [];
  }

  // abstract
  onPointClick(i) {}

  // abstract
  onPointMoved(point, i) {}

  // abstract
  makeExtraElements() {
    return null;
  }

  // abstract
  leafletComponent() {
    return Polygon;
  }

  // abstract
  getRenderPoints(points) {
    return points;
  }

  makeGuides() {
    const guides = this.calculateGuides();
    const { color } = this.props.figure;
    return guides.map((pos, i) => (
      <Polyline
        key={i}
        positions={pos}
        color={color}
        opacity={0.7}
        dashArray="4"
      />
    ));
  }

  render() {
    const { figure, options } = this.props;
    const { id, points, color } = figure;
    const { editing, finished, interactive, onSelect } = options;

    const renderPoints = this.getRenderPoints(points);

    const vertices = renderPoints.map((pos, i) => (
      <CircleMarker
        key={id + '-' + i}
        color={color}
        center={pos}
        radius={5}
        onClick={() => this.onPointClick(i)}
        draggable={editing}
        onDrag={e => {
          this.setState({
            draggedPoint: { point: e.target.getLatLng(), index: i },
          });
        }}
        onDragstart={e => this.setState({ dragging: true })}
        onDragend={e => {
          this.onPointMoved(e.target.getLatLng(), i);
          this.setState({ dragging: false, draggedPoint: null });
        }}
      />
    ));

    const guideLines = this.makeGuides();
    const PolyComp = this.leafletComponent();

    return (
      <Fragment key={id}>
        <PolyComp
          positions={renderPoints}
          color={color}
          weight={3}
          fill={true}
          fillColor={color}
          interactive={interactive}
          onClick={() => {
            if (interactive) {
              onSelect();
              skipNextClickEvent = true;
            }
          }}
        />
        {!finished || editing ? vertices : null}
        {guideLines}
        {this.makeExtraElements()}
      </Fragment>
    );
  }
}

class PolygonFigure extends Figure {
  constructor(props) {
    super(props);

    this.onPointClick = this.onPointClick.bind(this);
  }

  leafletComponent() {
    const {
      options: { finished },
    } = this.props;
    return finished ? Polygon : Polyline;
  }

  calculateGuides() {
    const { figure, options } = this.props;
    const { points } = figure;
    const { newPoint, finished } = options;
    const { draggedPoint } = this.state;

    const guides = [];
    if (draggedPoint) {
      const { point, index } = draggedPoint;
      const { length } = points;
      guides.push(
        [point, points[(index + 1) % length]],
        [point, points[(index - 1 + length) % length]]
      );
    }

    const additionalGuides =
      !finished && points.length > 0
        ? [[points[points.length - 1], newPoint]]
        : [];

    return guides.concat(additionalGuides);
  }

  makeExtraElements() {
    const { figure, options } = this.props;
    const { id, points } = figure;
    const { editing, finished, calcDistance, onChange } = options;

    const { dragging } = this.state;

    if (!finished || !editing || dragging) {
      return [];
    }

    const midPoints = points
      .map((pos, i) => [pos, points[(i + 1) % points.length], i])
      .filter(([a, b]) => calcDistance(a, b) > 40)
      .map(([a, b, i]) => (
        <CircleMarker
          key={id + '-' + i + '-mid'}
          color="white"
          center={midPoint(a, b)}
          radius={3}
          opacity={0.5}
          onClick={e => {
            onChange('add', { point: midPoint(a, b), pos: i + 1, figure });
            skipNextClickEvent = true;
          }}
        />
      ));

    return midPoints;
  }

  onPointMoved(point, index) {
    const {
      figure,
      options: { onChange },
    } = this.props;
    onChange('move', { point, pos: index, figure });
  }

  onPointClick(i) {
    const { figure, options } = this.props;
    const { points } = figure;
    const { finished, editing, onChange } = options;

    if (!finished && i === 0) {
      if (points.length >= 3) {
        onChange('end', {});
      }
      skipNextClickEvent = true;
      return false;
    }

    if (finished && editing) {
      if (points.length > 3) {
        onChange('remove', { pos: i, figure });
      }
      return false;
    }
  }
}

class BBoxFigure extends Figure {
  calculateGuides() {
    const { figure, options } = this.props;
    const { points } = figure;
    const { newPoint, finished } = options;
    const { draggedPoint } = this.state;

    if (draggedPoint) {
      const renderPoints = this.getRenderPoints(points);
      const { point, index } = draggedPoint;
      const oppPoint = renderPoints[(index + 2) % renderPoints.length];
      const sidePoint1 = { lat: oppPoint.lat, lng: point.lng };
      const sidePoint2 = { lat: point.lat, lng: oppPoint.lng };
      return [
        [point, sidePoint1],
        [sidePoint1, oppPoint],
        [point, sidePoint2],
        [sidePoint2, oppPoint],
      ];
    }

    if (!finished && points.length > 0) {
      const renderPoints = this.getRenderPoints([points[0], newPoint]);
      return [
        [renderPoints[0], renderPoints[1]],
        [renderPoints[1], renderPoints[2]],
        [renderPoints[2], renderPoints[3]],
        [renderPoints[3], renderPoints[0]],
      ];
    }

    return [];
  }

  getRenderPoints(points) {
    const [p1, p2] = points;
    if (!p1) {
      return [];
    }
    if (!p2) {
      return [p1];
    }

    return [
      { lat: p1.lat, lng: p1.lng },
      { lat: p1.lat, lng: p2.lng },
      { lat: p2.lat, lng: p2.lng },
      { lat: p2.lat, lng: p1.lng },
    ];
  }
}

function convertPoint(p) {
  return {
    lat: p.lat,
    lng: p.lng,
  };
}

function midPoint(p1, p2) {
  return {
    lat: (p1.lat + p2.lat) / 2,
    lng: (p1.lng + p2.lng) / 2,
  };
}
