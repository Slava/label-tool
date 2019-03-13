import React, { Component } from 'react';

import { Form, Segment, Button, Loader } from 'semantic-ui-react';

export default class ImportData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: null,
      loading: false,
    };
    this.handleFilesSubmit = this.handleFilesSubmit.bind(this);
  }

  async handleFilesSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    this.setState({ message: null });
    const res = await fetch('/api/import/' + this.props.projectId, {
      method: 'POST',
      body: formData,
    });
    const { message } = await res.json();
    this.setState({
      message,
      loading: false,
    });

    form.reset();
  }

  render() {
    const { message, loading } = this.state;
    const loader = loading ? <Loader /> : null;
    const messages = (message || '').split('\n').map(m => <div>{m}</div>);

    return (
      <Segment>
        <p>
          Import image labels exported from tools like{' '}
          <a href="https://labelbox.com">LabelBox</a>.
        </p>
        <p>
          The files must be formatted as a valid JSON, with corresponding image
          name in the "imagePath" field.
        </p>
        <p>
          Objects from the "shapes" field will be imported as polygons with
          corresponding labels created.
        </p>
        <Form
          method="post"
          encType="multipart/form-data"
          onSubmit={this.handleFilesSubmit}
        >
          <Form.Input
            label="Select JSON files"
            multiple
            type="file"
            id="files"
            name="files"
            accept=".json"
          />
          <Button type="submit">Import</Button>
        </Form>
        {loader}
        <div style={{ marginTop: '2em' }}>{messages}</div>
      </Segment>
    );
  }
}
