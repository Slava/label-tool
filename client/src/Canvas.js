import React, { Component } from 'react';
import L from 'leaflet';
import { Map, ImageOverlay } from 'react-leaflet';

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
    const { url } = this.props;
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
      >
        <ImageOverlay url={url} bounds={bounds} />
      </Map>
    );
  }
}
