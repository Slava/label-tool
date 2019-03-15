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
      const { imageUrl, demo } = this.props;

      if (imageUrl !== prevProps.imageUrl) {
        const img = new Image();
        const setState = this.setState.bind(this);
        img.onload = async function() {
          const { height, width } = this;
          setState({ height, width });

          const resetImage = () => {
            const canvas = document.getElementById('test-canvas');
            const ctx = canvas.getContext('2d');

            const scale = demo ? 0.5 : Math.min(800, height) / height;
            const sHeight = Math.floor(scale * height);
            const sWidth = Math.floor(scale * width);
            canvas.height = sHeight;
            canvas.width = sWidth;
            ctx.imageSmoothingQuality = 'high';
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(img, 0, 0, sWidth, sHeight);
            const imgB64 = canvas
              .toDataURL()
              .substring('data:image/png;base64,'.length);

            canvas.height = height;
            canvas.width = width;
            ctx.drawImage(img, 0, 0, width, height);
            const data = ctx.getImageData(0, 0, width, height).data;

            setState({ imageData: data, imgB64, b64Scaling: scale });
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
      const { height, width, imageData, imgB64, b64Scaling } = state;

      if (!height) return null;

      return (
        <Comp
          height={height}
          width={width}
          imageData={imageData}
          imgB64={imgB64}
          b64Scaling={b64Scaling}
          {...props}
        />
      );
    }
  };
}
