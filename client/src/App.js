import React, { Component } from 'react';
import { Container, Divider, Grid, Header, Image } from 'semantic-ui-react';

import 'semantic-ui-css/semantic.min.css';

import Canvas from './Canvas';
import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <Grid columns={3} divided stretched>
          <Grid.Row stretched>
            <Grid.Column width={4}>text 1</Grid.Column>
            <Grid.Column width={8}>
              <Canvas url="http://kempe.net/images/newspaper-big.jpg" />
            </Grid.Column>
            <Grid.Column width={4}>text 3</Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

export default App;
