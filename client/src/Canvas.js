import React, { Component, Fragment } from 'react';
import L from 'leaflet';
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
    };
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
    const st = props.color ? 'drawing' : null;
    if (
      !state.unfinishedFigure ||
      props.color !== state.unfinishedFigure.color
    ) {
      return {
        unfinishedFigure: {
          color: props.color,
          points: [],
        },
        state: st || state.state,
      };
    }

    return {
      state: st || state.state,
    };
  }

  calcBounds(url) {
    const crs = L.CRS.Simple;
    imgRef.src = url;
    imgRef.onload = () => {
      const { height, width } = imgRef;
      const southWest = crs.unproject({ x: 0, y: imgRef.height }, maxZoom - 1);
      const northEast = crs.unproject({ x: imgRef.width, y: 0 }, maxZoom - 1);
      const bounds = new L.LatLngBounds(southWest, northEast);

      this.setState({ bounds, height, width });
    };
  }

  render() {
    const { url, figures, color, onChange } = this.props;
    const { bounds, height, width, state, unfinishedFigure } = this.state;

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
            // should be working on the selected figure under editing
            //newState = update(newState, { $push: [point] });
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

    return (
      <Map
        crs={L.CRS.Simple}
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
      >
        <ImageOverlay url={url} bounds={bounds} />
        {state === 'drawing'
          ? Figure(unfinishedFigure, {
              finished: false,
              editing: false,
              onChange: handleChange,
            })
          : null}
        {figures.map(f => Figure(f, { editing: false, finished: true }))}
      </Map>
    );
  }
}

function Figure({ points, color }, { editing, finished, onChange }) {
  let polygon = points;
  if (finished) {
    polygon = points.concat([points[0]]);
  }

  const vertices =
    finished || editing
      ? null
      : points.map((pos, i) => (
          <CircleMarker
            key={JSON.stringify(pos)}
            color={color}
            fillColor="white"
            fill={true}
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
  return (
    <Fragment>
      <Polyline
        positions={polygon}
        color={color}
        weight={5}
        fill={true}
        fillColor={color}
        interactive={false}
      />
      {vertices}
    </Fragment>
  );
}

function convertPoint(p) {
  return {
    lat: p.lat,
    lng: p.lng,
  };
}
