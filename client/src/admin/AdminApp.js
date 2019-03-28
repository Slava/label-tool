import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import './AdminApp.css';
import Menubar from '../common/Menubar';
import ProjectsGrid from '../common/ProjectsGrid';
import ProjectPage from './ProjectPage';
import LoginPage from './LoginPage';

class AdminApp extends Component {
  render() {
    return (
      <Menubar active="admin">
        <Switch>
          <Route
            exact
            path="/admin/"
            render={() => (
              <ProjectsGrid
                linkPrefix="/admin/"
                title="Edit Projects:"
                newButton={true}
              />
            )}
          />
          <Route exact path="/admin/login" component={LoginPage} />
          <Route path="/admin/:projectId" component={ProjectPage} />
        </Switch>
      </Menubar>
    );
  }
}

export default AdminApp;
