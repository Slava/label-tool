import React, { Component } from 'react';

import {
  Button,
  Form,
  Grid,
  Divider,
  Message,
  Segment,
} from 'semantic-ui-react';

export default class UploadImages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      urlsText: '',
      localPath: '',
      urlsError: null,
      localPathError: null,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePathSubmit = this.handlePathSubmit.bind(this);
    this.handleFilesSubmit = this.handleFilesSubmit.bind(this);
  }

  handleChange(e, change) {
    const { name, value } = change;
    this.setState({
      [name]: value,
    });
  }

  async handleSubmit() {
    const { urlsText } = this.state;
    const { projectId } = this.props;

    if (!urlsText) return;

    const urls = urlsText
      .trim()
      .split('\n')
      .filter(line => line !== '');

    const resp = await fetch('/api/images/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        urls,
      }),
    });

    if (!resp.ok) {
      this.setState({
        urlsError: (await resp.json()).message,
      });
      return;
    }

    this.setState({
      urlsError: null,
    });

    this.props.onChange();
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

  async handlePathSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const { localPath } = this.state;
    const { projectId } = this.props;

    if (!localPath) return;

    const resp = await fetch('/api/images/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        localPath,
      }),
    });
    if (!resp.ok) {
      this.setState({
        localPathError: (await resp.json()).message,
      });
      return;
    }

    this.setState({
      localPathError: null,
    });
    this.props.onChange();

    form.reset();
  }

  render() {
    const { urlsText, urlsError, localPath, localPathError } = this.state;

    const urlsMessage = urlsError ? (
      <Message negative>{urlsError}</Message>
    ) : null;
    const localPathMessage = localPathError ? (
      <Message negative>{localPathError}</Message>
    ) : null;

    return (
      <Segment>
        <Grid columns={3} relaxed="very" stackable>
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
                placeholder="One URL per line i.e. https://images.com/cat.jpg"
                rows="3"
                value={urlsText}
                onChange={this.handleChange}
              />
              <Button>Source from URLs</Button>
            </Form>
            {urlsMessage}
          </Grid.Column>
          <Grid.Column>
            <Form onSubmit={this.handlePathSubmit}>
              <Form.Input
                name="localPath"
                label="Server's filesystem path"
                placeholder="i.e. /mnt/image-server/project-files/"
                value={localPath}
                onChange={this.handleChange}
              />
              <Button>Source from server's filesystem</Button>
            </Form>
            {localPathMessage}
          </Grid.Column>
        </Grid>

        <Divider vertical style={{ left: '33%' }}>
          Or
        </Divider>
        <Divider vertical style={{ left: '66%' }}>
          Or
        </Divider>
      </Segment>
    );
  }
}
