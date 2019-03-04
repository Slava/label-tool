import React, { Component } from 'react';

import {
  Header,
  Form,
  Segment,
  Table,
  Button,
  Loader,
} from 'semantic-ui-react';

const options = [
  { value: 'object_detection', text: 'Object Detection' },
  { value: 'object_classification', text: 'Object Classification' },
  { value: 'semantic_segmentation', text: 'Semantic Segmentation' },
];

const inputFormat = `
{
  "instances": [
    {
      "input_bytes": {
        "b64": "<str>"
      }
    }
  ]
}
`;

const outputFormats = {
  object_detection: `
{
  "predictions": [
    {
       "det_boxes": [<ymin>, <xmin>, <ymax>, <xmax>],
       "det_class": <str>,
       "det_score": <0 ~ 1 floating number
    },
    ...,
    ...
    ]
}
`,
  object_classification: `
{
  "predictions": [[<str>, <str>, <str>, <str>, <str>]]
}
`,
  semantic_segmentation: `
{
  "predictions": [[...], [...], [...], ...]
}
`,
};

export default class MLAssist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      models: null,
      currentValue: options[0].value,
      url: null,
      name: null,
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  componentDidMount() {
    this.reload();
  }

  async reload() {
    try {
      const models = await (await fetch('/api/mlmodels/')).json();
      this.setState({
        isLoaded: true,
        error: null,
        models,
      });
    } catch (error) {
      this.setState({
        isLoaded: true,
        error,
      });
    }
  }

  async onSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const type = this.state.currentValue;
    const { url, name } = this.state;
    await fetch('/api/mlmodels/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: {
          url,
          name,
          type,
        },
      }),
    });

    form.reset();
    this.reload();
  }

  async onDelete(id) {
    await fetch('/api/mlmodels/' + id, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.reload();
  }

  render() {
    const { error, isLoaded, models, currentValue } = this.state;
    const value = currentValue;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <Loader active inline="centered" />;
    }

    return (
      <Segment>
        <Form style={{ maxWidth: 600 }}>
          <Form.Select
            label="Model type"
            options={options}
            value={value}
            onChange={(e, { value }) => this.setState({ currentValue: value })}
          />
        </Form>
        <Header as="h3">Expected API format</Header>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Input Format</Table.HeaderCell>
              <Table.HeaderCell>Output Format</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                <pre>{inputFormat}</pre>
              </Table.Cell>
              <Table.Cell>
                <pre>{outputFormats[value]}</pre>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>

        <Header as="h3">End-points</Header>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>URL</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {models.map(({ id, name, url, type }) => (
              <Table.Row>
                <Table.Cell>{name}</Table.Cell>
                <Table.Cell>{url}</Table.Cell>
                <Table.Cell>{type}</Table.Cell>
                <Table.Cell>
                  <Button
                    icon="trash"
                    label="Delete"
                    size="tiny"
                    onClick={() => this.onDelete(id)}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        <Header as="h3">Add a new end-point</Header>
        <Form style={{ maxWidth: 600 }} onSubmit={this.onSubmit}>
          <Form.Input
            label="Display Name"
            placeholder="my_model"
            onChange={(e, { value }) => this.setState({ name: value })}
          />
          <Form.Input
            label="URL"
            placeholder="http://host:port/v1/models/{MODEL_NAME}:predict"
            onChange={(e, { value }) => this.setState({ url: value })}
          />
          <Button type="submit">Add</Button>
        </Form>
      </Segment>
    );
  }
}
