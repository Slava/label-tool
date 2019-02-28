import React, { Component } from 'react';

import {
  Header,
  Divider,
  Button,
  Input,
  Form,
  Message,
  Segment,
} from 'semantic-ui-react';

export default class UploadReference extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadError: null,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFileSubmit = this.handleFileSubmit.bind(this);
  }

  async handleSubmit() {
    const resp = await fetch('/api/images/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    this.props.onChange();
    this.setState({ urlsText: '' });
  }

  async handleFileSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const resp = await fetch(
      '/api/uploads/' + this.props.project.id + '/reference',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!resp.ok) {
      this.setState({
        uploadError: (await resp.json()).message,
      });
      return;
    }

    this.setState({
      uploadError: null,
    });

    form.reset();
    this.props.onUpload();
  }

  render() {
    const { uploadError } = this.state;
    const { onChange, project } = this.props;
    const { referenceText, referenceLink } = project;

    const uploadErrorMessage = uploadError ? (
      <Message negative>{uploadError}</Message>
    ) : null;

    let preview = null;
    if (referenceText || referenceLink) {
      const img = referenceLink ? (
        <img style={{ width: 'auto', maxWidth: '100%' }} src={referenceLink} />
      ) : null;
      preview = (
        <div>
          <Header>Preview</Header>
          <p>
            This is what the reference image and text would look like on the top
            of the labeling page:
          </p>
          <Segment>
            {img}
            {referenceText}
          </Segment>
          <Divider />
        </div>
      );
    }

    return (
      <Segment>
        {preview}
        <Form
          method="post"
          encType="multipart/form-data"
          onSubmit={this.handleFileSubmit}
        >
          <Form.Input
            label="Upload image from disk"
            type="file"
            id="referenceImage"
            name="referenceImage"
            accept=".jpg, .jpeg, .png"
            action="Upload"
            style={{ maxWidth: 600 }}
          />
        </Form>
        {uploadErrorMessage}
        <Form style={{ marginTop: '1em', maxWidth: 600 }}>
          <Form.TextArea
            autoHeight
            label="Reference Text"
            placeholder="Instructions, descriptions, etc"
            defaultValue={referenceText}
            onChange={(e, { value }) =>
              onChange({ referenceText: value, referenceLink })
            }
          />
        </Form>
      </Segment>
    );
  }
}
