import React, { Component } from 'react';
import L from 'leaflet';
import { Map, ImageOverlay, Polyline, CircleMarker } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

const maxZoom = 7;
let imgRef = new Image();
export default class Canvas extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      bounds: null,
      height: null,
      width: null,
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
    const { url, polygon, color, onChange } = this.props;
    const { bounds, height, width } = this.state;

    if (!bounds) {
      return null;
    }

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
        onClick={e => onChange('add', { point: convertPoint(e.latlng) })}
      >
        <ImageOverlay url={url} bounds={bounds} />
        <Polyline
          positions={polygon}
          color={color}
          weight={5}
          fill={true}
          fillColor={color}
          interactive={false}
        />
        {polygon.map((pos, i) => (
          <CircleMarker
            key={JSON.stringify(pos)}
            color={color}
            fillColor="white"
            fill={true}
            center={pos}
            radius={5}
            onClick={() => {
              if (i == 0) {
                onChange('add', { point: pos });
                return false;
              }
            }}
          />
        ))}
      </Map>
    );
  }
}

function convertPoint(p) {
  return {
    lat: p.lat,
    lng: p.lng,
  };
}
