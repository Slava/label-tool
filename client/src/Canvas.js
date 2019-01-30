import React, { Component, Fragment } from 'react';
import { CRS, LatLngBounds } from 'leaflet';
import { Map, ImageOverlay, Polyline, CircleMarker } from 'react-leaflet';
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
      state: 'none', // enum { none, editing, drawing }
      unfinishedFigure: null,
      selectedFigure: null,
    };

    this.mapRef = React.createRef();
  }

  componentDidMount() {
    this.calcBounds(this.props.url);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.url !== nextProps.url) {
      this.calcBounds(nextProps.url);
    }
  }

  static getDerivedStateFromProps(props, state) {
    const st =
      state.state !== 'editing'
        ? props.color
          ? 'drawing'
          : 'none'
        : 'editing';

    if (props.color !== state.lastColor && props.color) {
      return {
        unfinishedFigure: {
          id: 'unfinished',
          color: props.color,
          points: [],
        },
        lastColor: props.color,
        state: 'drawing',
      };
    }

    return {
      state: st,
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

  render() {
    const { url, figures, onChange } = this.props;
    const {
      bounds,
      zoom,
      height,
      width,
      state,
      unfinishedFigure,
      selectedFigure,
    } = this.state;

    if (!bounds) {
      return null;
    }

    const handleChange = (eventType, { point, pos, figure }) => {
      switch (eventType) {
        case 'add':
          if (state === 'drawing') {
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
      }
    };

    const calcDistance = (p1, p2) => {
      const map = this.mapRef.current.leafletElement;
      return map.latLngToLayerPoint(p1).distanceTo(map.latLngToLayerPoint(p2));
    };

    const unfinishedDrawingDOM =
      state === 'drawing'
        ? Figure(unfinishedFigure, {
            finished: false,
            editing: false,
            interactive: false,
            onChange: handleChange,
            calcDistance,
          })
        : null;

    const figuresDOM = figures.map((f, i) =>
      Figure(f, {
        editing:
          selectedFigure && selectedFigure.id === f.id && state === 'editing',
        finished: true,
        interactive: state !== 'drawing',
        onSelect: () => this.setState({ selectedFigure: f, state: 'editing' }),
        onChange: handleChange,
        calcDistance,
      })
    );

    const hotkeysDOM =
      state === 'editing' ? (
        <Hotkeys
          keyName="backspace,del"
          onKeyDown={() => onChange('delete', selectedFigure)}
        />
      ) : null;

    return (
      <Map
        crs={CRS.Simple}
        zoom={zoom}
        minZoom={-50}
        maxZoom={maxZoom}
        center={[height / 2, width / 2]}
        zoomAnimation={false}
        zoomSnap={0.1}
        attributionControl={false}
        onClick={e => {
          if (skipNextClickEvent) {
            // a hack, for whatever reason it is really hard to stop event propagation in leaflet
            skipNextClickEvent = false;
            return;
          }
          if (state === 'drawing')
            handleChange('add', { point: convertPoint(e.latlng) });
        }}
        onZoom={e => this.setState({ zoom: e.target.getZoom() })}
        ref={this.mapRef}
      >
        <ImageOverlay url={url} bounds={bounds} />
        {unfinishedDrawingDOM}
        {figuresDOM}
        {hotkeysDOM}
      </Map>
    );
  }
}

function Figure(figure, options) {
  const { id, points, color } = figure;
  const {
    editing,
    finished,
    interactive,
    calcDistance,
    onChange,
    onSelect,
  } = options;

  let polygon = points;
  if (finished) {
    polygon = points.concat([points[0]]);
  }

  const vertices = points.map((pos, i) => (
    <CircleMarker
      key={id + '-' + i}
      color={color}
      center={pos}
      radius={5}
      onClick={e => {
        if (!finished && i === 0) {
          onChange('end', {});
          skipNextClickEvent = true;
          return false;
        }
      }}
      draggable={editing}
      onDragend={e =>
        onChange('move', { point: e.target.getLatLng(), pos: i, figure })
      }
    />
  ));

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
        }}
      />
    ));

  const allCircles = (!finished || editing ? vertices : []).concat(
    finished && editing ? midPoints : []
  );

  return (
    <Fragment key={id}>
      <Polyline
        positions={polygon}
        color={color}
        weight={3}
        fill={true}
        fillColor={color}
        interactive={interactive}
        onClick={() => interactive && onSelect()}
      />
      {allCircles}
    </Fragment>
  );
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
