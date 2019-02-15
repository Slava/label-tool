import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Container, Menu } from 'semantic-ui-react';

export default class Menubar extends Component {
  render() {
    return (
      <div style={{ background: '#f7f7f7', minHeight: '100vh' }}>
        <Menu inverted>
          <Link to="/">
            <Menu.Item header>Image Labeling</Menu.Item>
          </Link>
          <Link to="/admin/">
            <Menu.Item name="projects" />
          </Link>
          <Link to="/">
            <Menu.Item name="labeling interface" />
          </Link>
        </Menu>
        <Container>{this.props.children}</Container>
      </div>
    );
  }
}
