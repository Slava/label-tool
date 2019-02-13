import React, { Component } from 'react';

import { Button, Form, Grid, Divider, Segment } from 'semantic-ui-react';

export default class UploadImages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      urlsText: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFilesSubmit = this.handleFilesSubmit.bind(this);
  }

  handleChange(e, change) {
    const { name, value } = change;
    this.setState({
      [name]: value,
    });
  }

  handleSubmit() {
    const { urlsText } = this.state;
    const { projectId } = this.props;

    if (!urlsText) return;

    const urls = urlsText
      .trim()
      .split('\n')
      .filter(line => line !== '');

    fetch('/api/images/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        urls,
      }),
    });

    this.setState({ urlsText: '' });
  }

  async handleFilesSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    await fetch('/api/uploads/' + this.props.projectId, {
      method: 'POST',
      body: formData,
    });

    this.props.onChange();

    form.reset();
  }

  render() {
    const { urlsText } = this.state;

    return (
      <Segment>
        <Grid columns={2} relaxed="very" stackable>
          <Grid.Column>
            <Form
              method="post"
              encType="multipart/form-data"
              onSubmit={this.handleFilesSubmit}
            >
              <Form.Input
                label="Upload files from disk"
                multiple
                type="file"
                id="images"
                name="images"
                accept=".jpg, .jpeg, .png"
              />
              <Button type="submit">Upload</Button>
            </Form>
          </Grid.Column>

          <Grid.Column verticalAlign="middle">
            <Form onSubmit={this.handleSubmit}>
              <Form.TextArea
                name="urlsText"
                label="Images URLs"
                rows="3"
                value={urlsText}
                onChange={this.handleChange}
              />
              <Button>Submit</Button>
            </Form>
          </Grid.Column>
        </Grid>

        <Divider vertical>Or</Divider>
      </Segment>
    );
  }
}
