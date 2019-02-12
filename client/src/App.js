import React, { Component, Fragment } from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';

import LabelingApp from './LabelingApp';
import AdminApp from './AdminApp';

class App extends Component {
  render() {
    return (
      <Router>
        <Fragment>
          <Route exact path="/" component={LabelingApp} />
          <Route path="/admin" component={AdminApp} />
        </Fragment>
      </Router>
    );
  }
}

export default App;
