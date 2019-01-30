import React, { Component, Fragment } from 'react';
import { CRS, LatLngBounds } from 'leaflet';
import { Map, ImageOverlay, Polyline, CircleMarker } from 'react-leaflet';
import update from 'immutability-helper';

import 'leaflet/dist/leaflet.css';

const maxZoom = 7;
let imgRef = new Image();
let skipNextClickEvent = false;
export default class Canvas extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      bounds: null,
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
    if (
      !state.unfinishedFigure ||
      props.color !== state.unfinishedFigure.color
    ) {
      return {
        unfinishedFigure: {
          color: props.color,
          points: [],
        },
        state: st,
      };
    }

    return {
      state: st,
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
    const { url, figures, color, onChange } = this.props;
    const {
      bounds,
      height,
      width,
      state,
      unfinishedFigure,
      selectedFigure,
    } = this.state;

    if (!bounds) {
      return null;
    }

    const handleChange = (eventType, { point, pos }) => {
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
            //onChange('edit', );
          }
          break;

        case 'end':
          const figure = unfinishedFigure;
          onChange('new', { figure });
          this.setState({
            unfinishedFigure: {
              color,
              points: [],
            },
          });
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
        key: i,
        editing: selectedFigure === f && state === 'editing',
        finished: true,
        interactive: state !== 'drawing',
        onSelect: () => this.setState({ selectedFigure: f, state: 'editing' }),
        onChange: handleChange,
        calcDistance,
      })
    );

    return (
      <Map
        crs={CRS.Simple}
        zoom={-1}
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
        ref={this.mapRef}
      >
        <ImageOverlay url={url} bounds={bounds} />
        {unfinishedDrawingDOM}
        {figuresDOM}
      </Map>
    );
  }
}

function Figure({ points, color }, options) {
  const {
    key,
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
      key={JSON.stringify(pos)}
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
    />
  ));

  const midPoints = points
    .map((pos, i) => [pos, points[(i + 1) % points.length], i])
    .filter(([a, b]) => calcDistance(a, b) > 40)
    .map(([a, b, i]) => (
      <CircleMarker
        key={JSON.stringify(a) + '-mid'}
        color="white"
        center={midPoint(a, b)}
        radius={3}
        opacity={0.5}
        onClick={e => {
          onChange('add', { point: midPoint(a, b), pos: i + 1 });
        }}
      />
    ));

  const allCircles = (!finished || editing ? vertices : []).concat(
    finished && editing ? midPoints : []
  );

  return (
    <Fragment key={key}>
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
