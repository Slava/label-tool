import React, { Component } from 'react';
import { Grid, Container, Header, List, Label } from 'semantic-ui-react';

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

function ListItem({ shortcut, label, onSelect, color, selected = false }) {
  return (
    <List.Item onClick={onSelect} active={selected}>
      <Label color={color} horizontal>
        {shortcut}
      </Label>{' '}
      {label}
    </List.Item>
  );
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: null,
    };
  }
  render() {
    const labels = ['cat', 'dog', 'car', 'tree', 'another one'];
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
                      selected: this.state.selected === label,
                    })
                  )}
                </List>
              </div>
            </Grid.Column>
            <Grid.Column width={12} style={{ padding: 0 }}>
              <Canvas url="http://kempe.net/images/newspaper-big.jpg" />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

export default App;
