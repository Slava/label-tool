import React, { Component } from 'react';

import { Header, Form, Segment } from 'semantic-ui-react';

export default class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      error: null,
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  async onSubmit(e) {
    const { password } = this.state;
    const resp = await fetch('/api/auth?password=' + password);
    if (resp.ok) {
      this.setState({ error: null });
      window.location = '/admin/';
    } else {
      this.setState({ error: 'Wrong password' });
    }
  }

  render() {
    return (
      <Segment>
        <Form onSubmit={this.onSubmit}>
          <Header>Admin Login</Header>
          <Form.Input
            onChange={(e, { value }) => this.setState({ password: value })}
            type="password"
            label="Password"
          />
          <Form.Button>Submit</Form.Button>
          <p style={{ color: 'red' }}>{this.state.error}</p>
        </Form>
      </Segment>
    );
  }
}
