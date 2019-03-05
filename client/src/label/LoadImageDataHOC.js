import React, { Component } from 'react';

export function withLoadImageData(Comp) {
  return class LoadImageLayer extends Component {
    constructor(props) {
      super(props);
      this.state = {
        height: null,
        width: null,
        imageData: null,
      };

      this.componentDidUpdate({}, this.state);
    }

    componentDidUpdate(prevProps, prevState) {
      const { imageUrl } = this.props;

      if (imageUrl !== prevProps.imageUrl) {
        const img = new Image();
        const setState = this.setState.bind(this);
        img.onload = async function() {
          const { height, width } = this;
          setState({ height, width });

          const resetImage = () => {
            const canvas = document.getElementById('test-canvas');
            const ctx = canvas.getContext('2d');
            canvas.height = height;
            canvas.width = width;
            ctx.drawImage(img, 0, 0, width, height);
            const data = ctx.getImageData(0, 0, width, height).data;
            const imgB64 = canvas
              .toDataURL()
              .substring('data:image/png;base64,'.length);
            setState({ imageData: data, imgB64 });
          };

          if (document.readyState !== 'loading') {
            resetImage();
          } else {
            document.addEventListener('DOMContentLoaded', resetImage);
          }
        };
        img.src = imageUrl;
      }
    }

    render() {
      const { props, state } = this;
      const { height, width, imageData, imgB64 } = state;

      return (
        <Comp
          height={height}
          width={width}
          imageData={imageData}
          imgB64={imgB64}
          {...props}
        />
      );
    }
  };
}
