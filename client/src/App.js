import React, { Component, Fragment } from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';

import LabelingLoader from './label/LabelingLoader';
import OverScreen from './label/OverScreen';
import AdminApp from './admin/AdminApp';

class App extends Component {
  render() {
    return (
      <Router>
        <Fragment>
          <Route
            exact
            path="/"
            render={({ match, history }) => {
              if (match.path === '/') history.replace('/admin');
              return null;
            }}
          />
          <Route path="/admin" component={AdminApp} />
          <Route exact path="/label/:projectId" component={LabelingLoader} />
          <Route
            exact
            path="/label/:projectId/:imageId"
            render={props =>
              props.match.params.imageId === 'over' ? (
                <OverScreen {...props} />
              ) : (
                <LabelingLoader {...props} />
              )
            }
          />
        </Fragment>
      </Router>
    );
  }
}

export default App;
