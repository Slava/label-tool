import React, { Component } from 'react';
import { Grid, Container, Header, List, Label } from 'semantic-ui-react';
import update from 'immutability-helper';

import 'semantic-ui-css/semantic.min.css';

import Canvas from './Canvas';
import './App.css';

const shortcuts = '1234567890qwe';
const colors = [
  'red',
  'blue',
  'green',
  'violet',
  'orange',
  'brown',
  'yellow',
  'olive',
  'teal',
  'purple',
  'pink',
  'grey',
  'black',
];
const labels = ['cat', 'dog', 'car', 'tree', 'another one'];

function ListItem({ shortcut, label, onSelect, color, selected = false }) {
  return (
    <List.Item onClick={onSelect} active={selected} key={label}>
      <Label color={color} horizontal>
        {shortcut}
      </Label>
      {label}
    </List.Item>
  );
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: null,
      polygons: {}, // mapping from label name to a list of polygon structures
    };
    labels.map(label => (this.state.polygons[label] = []));

    this.handleOnChange = this.handleOnChange.bind(this);
  }
  handleOnChange(eventType, { figure }) {
    const label = labels[colors.indexOf(figure.color)];
    this.setState({
      polygons: update(this.state.polygons, {
        [label]: {
          $push: [figure.points],
        },
      }),
    });
  }

  render() {
    const { polygons, selected } = this.state;
    const figures = [];
    labels.map((label, i) =>
      polygons[label].map(poly =>
        figures.push({ color: colors[i], points: poly })
      )
    );

    return (
      <div>
        <Grid columns={3} divided stretched>
          <Grid.Row stretched>
            <Grid.Column width={4} style={{ overflow: 'auto' }}>
              <div style={{ padding: '1em 0' }}>
                <Header size="large" align="center">
                  Labels
                </Header>
                <List divided selection>
                  {labels.map((label, i) =>
                    ListItem({
                      shortcut: shortcuts[i],
                      label,
                      color: colors[i],
                      onSelect: () => {
                        this.setState({ selected: label });
                      },
                      selected: selected === label,
                    })
                  )}
                </List>
              </div>
            </Grid.Column>
            <Grid.Column width={12} style={{ padding: 0 }}>
              <Canvas
                url="http://kempe.net/images/newspaper-big.jpg"
                figures={figures}
                color={colors[labels.indexOf(selected)]}
                onChange={this.handleOnChange}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

export default App;
