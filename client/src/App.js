import React, { Component } from 'react';
import { Grid, Container, Header, List, Label } from 'semantic-ui-react';
import Hotkeys from 'react-hot-keys';
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
      <Hotkeys keyName={shortcut} onKeyDown={onSelect}>
        <Label color={color} horizontal>
          {shortcut}
        </Label>
        {label}
      </Hotkeys>
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
  handleOnChange(eventType, figure) {
    const label = labels[colors.indexOf(figure.color)];
    const { polygons } = this.state;
    switch (eventType) {
      case 'new':
        this.setState({
          polygons: update(polygons, {
            [label]: {
              $push: [{ id: genId(), points: figure.points }],
            },
          }),
          selected: null, // deselect the label after the figure is finished
        });
        break;

      case 'replace':
        const replIdx = polygons[label].findIndex(f => f.id === figure.id);
        this.setState({
          polygons: update(polygons, {
            [label]: {
              $splice: [[replIdx, 1, { id: figure.id, points: figure.points }]],
            },
          }),
        });
        break;
    }
  }

  render() {
    const { polygons, selected } = this.state;
    const figures = [];
    labels.map((label, i) =>
      polygons[label].map(poly =>
        figures.push({ color: colors[i], points: poly.points, id: poly.id })
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
                  <Hotkeys
                    keyName="esc"
                    onKeyDown={() => this.setState({ selected: null })}
                  />
                </List>
              </div>
            </Grid.Column>
            <Grid.Column width={12} style={{ padding: 0 }}>
              <Canvas
                url="http://kempe.net/images/newspaper-big.jpg"
                figures={figures}
                color={selected ? colors[labels.indexOf(selected)] : null}
                onChange={this.handleOnChange}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

function genId() {
  return (
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15)
  );
}

export default App;
