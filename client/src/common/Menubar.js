import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Container, Menu, Icon } from 'semantic-ui-react';

export default class Menubar extends Component {
  render() {
    const { active } = this.props;
    return (
      <div style={{ background: '#f7f7f7', minHeight: '100vh' }}>
        <Menu inverted>
          <Container>
            <Menu.Item header>Image Labeling</Menu.Item>
            <Link to="/">
              <Menu.Item active={active === 'label'}>
                <Icon name="tag" style={{ marginRight: '5px' }} />
                Label
              </Menu.Item>
            </Link>
            <Link to="/admin/">
              <Menu.Item active={active === 'admin'}>
                <Icon name="pencil" style={{ marginRight: '5px' }} />
                Admin
              </Menu.Item>
            </Link>
            <Link to="/help/">
              <Menu.Item active={active === 'help'}>
                <Icon name="help circle" style={{ marginRight: '5px' }} />
                Help
              </Menu.Item>
            </Link>
          </Container>
        </Menu>

        <Container>{this.props.children}</Container>
      </div>
    );
  }
}
