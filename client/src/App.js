import React, { Component, Fragment } from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';

import LabelingLoader from './label/LabelingLoader';
import AdminApp from './admin/AdminApp';

class App extends Component {
  render() {
    return (
      <Router>
        <Fragment>
          <Route path="/admin" component={AdminApp} />
          <Route exact path="/label/:projectId" component={LabelingLoader} />
          <Route
            exact
            path="/label/:projectId/:imageId"
            component={LabelingLoader}
          />
          <Route
            path="/label/:projectId/:imageId/:labelId"
            component={LabelingLoader}
          />
        </Fragment>
      </Router>
    );
  }
}

export default App;
