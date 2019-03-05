import React, { Component } from 'react';
import update from 'immutability-helper';

export function withPredictions(Comp) {
  return class extends Component {
    constructor(props) {
      super(props);
      this.state = {
        predictions: {},
        models: [],
      };

      this.makePrediction = this.makePrediction.bind(this);
    }

    async makePrediction(model) {
      const { imgB64 } = this.props;
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
      this.setState({
        predictions: update(this.state.predictions, {
          [model.id]: {
            $set: resp.predictions,
          },
        }),
      });
    }

    async componentDidMount() {
      const models = await (await fetch('/api/mlmodels/')).json();
      this.setState({ models });
    }

    componentDidUpdate(prevProps, prevState) {
      const { imgB64 } = this.props;

      if (imgB64 !== prevProps.imgB64) {
        this.setState({
          predictions: {},
        });
      }
    }

    render() {
      const { props, state } = this;
      const { imgB64, ...passedProps } = props;
      const { models, predictions } = state;
      const newProps = {
        models,
        predictions,
        makePrediction: this.makePrediction,
      };

      return <Comp {...newProps} {...passedProps} />;
    }
  };
}
