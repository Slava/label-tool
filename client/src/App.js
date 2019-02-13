import React, { Component, Fragment } from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';

import LabelingApp from './label/LabelingApp';
import AdminApp from './admin/AdminApp';

class App extends Component {
  render() {
    return (
      <Router>
        <Fragment>
          <Route path="/admin" component={AdminApp} />
          <Route path="/label/:projectId/:imageId" component={LabelingApp} />
        </Fragment>
      </Router>
    );
  }
}

export default App;
