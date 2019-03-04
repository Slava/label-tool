import React, { Component } from 'react';
import { CRS, LatLngBounds } from 'leaflet';

export const maxZoom = 7;
export function withImageLoading(Comp) {
  let imgRef = new Image();
  return class extends Component {
    constructor(props) {
      super(props);
      this.state = {
        bounds: null,
        height: null,
        width: null,
      };
    }

    componentDidMount() {
      this.calcBounds(this.props.url);
    }

    componentDidUpdate(prevProps) {
      const { url } = this.props;

      if (url !== prevProps.url) {
        this.calcBounds(url);
      }
    }

    calcBounds(url) {
      const crs = CRS.Simple;
      imgRef.src = url;
      imgRef.onload = () => {
        const { height, width } = imgRef;
        const southWest = crs.unproject(
          { x: 0, y: imgRef.height },
          maxZoom - 1
        );
        const northEast = crs.unproject({ x: imgRef.width, y: 0 }, maxZoom - 1);
        const bounds = new LatLngBounds(southWest, northEast);

        this.setState({ bounds, height, width });
      };
    }

    render() {
      const { props, state } = this;
      const { bounds, height, width } = state;
      if (!bounds) return null;
      return <Comp bounds={bounds} height={height} width={width} {...props} />;
    }
  };
}
