import React, { Component } from 'react';
import { Link, Switch, Route } from 'react-router-dom';

import { Container, Menu } from 'semantic-ui-react';

import './AdminApp.css';
import ProjectsGrid from './ProjectsGrid';
import ProjectPage from './ProjectPage';

class AdminApp extends Component {
  render() {
    return (
      <div style={{ background: '#f7f7f7', minHeight: '100vh' }}>
        <Menu inverted>
          <Link to="/admin/">
            <Menu.Item header>Image Labeling</Menu.Item>
          </Link>
          <Link to="/admin/">
            <Menu.Item name="projects" />
          </Link>
          <Link to="/">
            <Menu.Item name="labeling interface" />
          </Link>
        </Menu>
        <Container>
          <Switch>
            <Route exact path="/admin/" component={ProjectsGrid} />
            <Route path="/admin/:projectId" component={ProjectPage} />
          </Switch>
        </Container>
      </div>
    );
  }
}

export default AdminApp;
