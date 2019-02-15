import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Message } from 'semantic-ui-react';

export default class OverScreen extends Component {
  render() {
    const { projectId } = this.props.match.params;

    return (
      <Message style={{ maxWidth: 600, margin: '100px auto' }}>
        <Message.Header>No more images in this project</Message.Header>
        <p>
          To upload more images or view previously tagged ones head to the{' '}
          <Link to={`/admin/${projectId}`}>admin panel</Link>.
        </p>
      </Message>
    );
  }
}
