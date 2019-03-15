import React, { Component } from 'react';
import { genId } from './utils';
import { vectorizeSegmentation } from './tracing';

export function withPredictions(Comp) {
  return class PredictionsLayer extends Component {
    constructor(props) {
      super(props);
      this.state = {
        models: [],
      };

      this.makePrediction = this.makePrediction.bind(this);
    }

    async makePrediction(model, options = {}) {
      const { imgB64, b64Scaling, height, width, fetch } = this.props;
      const { id } = model;

      const req = fetch('/api/mlmodels/' + id, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [
            {
              input_bytes: {
                b64: imgB64,
              },
            },
          ],
        }),
      });

      const resp = await (await req).json();

      if (model.type === 'object_detection') {
        const preds = [];
        resp.predictions.forEach(({ det_boxes: [y1, x1, y2, x2] }) => {
          preds.push({
            type: 'bbox',
            color: 'gray',
            points: [
              { lng: x1 * width, lat: (1 - y1) * height },
              { lng: x2 * width, lat: (1 - y2) * height },
            ],
            id: genId(),
            modelId: model.id,
          });
        });
        return preds;
      } else if (model.type === 'semantic_segmentation') {
        const imageData = resp.predictions[0].raw_image;
        const { smoothing } = options;
        const vectors = vectorizeSegmentation(imageData, {
          scaling: b64Scaling,
          smoothing,
        });
        return vectors.map(path => ({
          type: 'polygon',
          color: 'gray',
          points: path,
          id: genId(),
          modelId: model.id,
        }));
      }

      return resp.predictions;
    }

    async componentDidMount() {
      const { fetch } = this.props;
      const models = await (await fetch('/api/mlmodels')).json();
      this.setState({ models });
    }

    render() {
      const { props, state } = this;
      const { imgB64, ...passedProps } = props;
      const { models } = state;
      const newProps = {
        models,
        makePrediction: this.makePrediction,
      };

      return <Comp {...newProps} {...passedProps} />;
    }
  };
}
