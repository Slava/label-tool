import React, { Component } from 'react';
import update from 'immutability-helper';

export function withHistory(Comp) {
  return class extends Component {
    constructor(props) {
      super(props);

      const { labelData, labels } = props;
      const figures = {};

      labels.map(label => (figures[label.id] = []));
      Object.keys(labelData).forEach(key => {
        figures[key] = (figures[key] || []).concat(labelData[key]);
      });
      this.state = {
        figures, // mapping from label name to a list of Figure structures
        unfinishedFigure: null,
        figuresHistory: [],
        unfinishedFigureHistory: [],
      };

      this.pushState = this.pushState.bind(this);
      this.popState = this.popState.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
      const { onLabelChange, height, width } = this.props;
      const { figures } = this.state;

      if (figures !== prevState.figures) {
        onLabelChange({
          labels: figures,
          height,
          width,
        });
      }
    }

    pushState(stateChange, cb) {
      this.setState(
        state => ({
          figuresHistory: update(state.figuresHistory, {
            $push: [state.figures],
          }),
          unfinishedFigureHistory: update(state.unfinishedFigureHistory, {
            $push: [state.unfinishedFigure],
          }),
          ...stateChange(state),
        }),
        cb
      );
    }

    popState() {
      this.setState(state => {
        let { figuresHistory, unfinishedFigureHistory } = state;
        if (!figuresHistory.length) {
          return {};
        }

        figuresHistory = figuresHistory.slice();
        unfinishedFigureHistory = unfinishedFigureHistory.slice();
        const figures = figuresHistory.pop();
        let unfinishedFigure = unfinishedFigureHistory.pop();

        if (unfinishedFigure && !unfinishedFigure.points.length) {
          unfinishedFigure = null;
        }

        return {
          figures,
          unfinishedFigure,
          figuresHistory,
          unfinishedFigureHistory,
        };
      });
    }

    render() {
      const { props, state, pushState, popState } = this;
      const { figures, unfinishedFigure } = state;
      const passedProps = {
        pushState,
        popState,
        figures,
        unfinishedFigure,
      };
      return <Comp {...passedProps} {...props} />;
    }
  };
}
