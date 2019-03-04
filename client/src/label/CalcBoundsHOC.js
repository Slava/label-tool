import React, { Component, forwardRef } from 'react';
import { CRS, LatLngBounds } from 'leaflet';

export const maxZoom = 7;
export function withBounds(Comp) {
  let imgRef = new Image();
  class LoadImage extends Component {
    constructor(props) {
      super(props);
      this.state = {
        bounds: null,
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
      const { height, width } = this.props;

      imgRef.src = url;
      const southWest = crs.unproject({ x: 0, y: imgRef.height }, maxZoom - 1);
      const northEast = crs.unproject({ x: imgRef.width, y: 0 }, maxZoom - 1);
      const bounds = new LatLngBounds(southWest, northEast);

      this.setState({ bounds });
    }

    render() {
      const { props, state } = this;
      const { forwardedRef, ...rest } = props;
      const { bounds } = state;
      if (!bounds) return null;
      return <Comp bounds={bounds} ref={forwardedRef} {...rest} />;
    }
  }

  return forwardRef((props, ref) => (
    <LoadImage {...props} forwardedRef={ref} />
  ));
}
