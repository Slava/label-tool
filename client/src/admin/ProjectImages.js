import React, { Component } from 'react';

import { Table, Loader, Header, Checkbox, Button } from 'semantic-ui-react';

import update from 'immutability-helper';
import shallowEqualObjects from 'shallow-equal/objects';

export default class ProjectImages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      images: [],
    };

    this.handleLabeled = this.handleLabeled.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.markAllNotLabeled = this.markAllNotLabeled.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { projectId } = this.props;
    if (
      projectId === nextProps.projectId &&
      shallowEqualObjects(this.state, nextState)
    ) {
      return false;
    }
    return true;
  }

  async componentDidMount() {
    this.props.refetchRef(this.refetch.bind(this));
    await this.refetch();
  }

  async refetch() {
    const { projectId } = this.props;
    try {
      const images = await (await fetch(
        '/api/images/?projectId=' + projectId
      )).json();
      this.setState({
        isLoaded: true,
        images,
      });
    } catch (error) {
      this.setState({
        isLoaded: true,
        error,
      });
    }
  }

  handleLabeled(imageId, labeled) {
    const { images } = this.state;
    const idx = images.findIndex(x => x.id === imageId);
    this.setState(state => ({
      images: update(state.images, {
        $splice: [[idx, 1, { ...state.images[idx], labeled }]],
      }),
    }));

    fetch('/api/images/' + imageId, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ labeled }),
    });
  }

  handleDelete(imageId) {
    const { images } = this.state;
    const idx = images.findIndex(x => x.id === imageId);
    this.setState(state => ({
      images: update(state.images, {
        $splice: [[idx, 1]],
      }),
    }));

    fetch('/api/images/' + imageId, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  markAllNotLabeled() {
    const { images } = this.state;
    images.forEach(image => this.handleLabeled(image.id, false));
  }

  render() {
    const { projectId } = this.props;
    const { error, isLoaded, images } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <Loader active inline="centered" />;
    }

    if (!images.length) {
      return (
        <Header className="centered" as="h5">
          No images, upload images using the form below
        </Header>
      );
    }

    const renderLabelLinks = image => {
      return (
        <Checkbox
          checked={!!image.labeled}
          label="Labeled"
          onChange={(e, { checked }) => this.handleLabeled(image.id, checked)}
        />
      );
    };

    const renderActions = image => {
      return (
        <div>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`/label/${projectId}/${image.id}`}
          >
            <Button icon="pencil" label="Edit" size="tiny" />
          </a>
          <Button
            icon="trash"
            label="Delete"
            size="tiny"
            onClick={() => this.handleDelete(image.id)}
          />
        </div>
      );
    };

    const renderedRows = images.map(image => (
      <Table.Row key={image.id}>
        <Table.Cell>{image.id}</Table.Cell>
        <Table.Cell>
          <a href={image.link}>{image.originalName}</a>
        </Table.Cell>
        <Table.Cell>{renderLabelLinks(image)}</Table.Cell>
        <Table.Cell>{renderActions(image)}</Table.Cell>
      </Table.Row>
    ));

    return (
      <div>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Image Link</Table.HeaderCell>
              <Table.HeaderCell>Label Status</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>{renderedRows}</Table.Body>
        </Table>
        <Button
          style={{ float: 'right' }}
          icon="cancel"
          label="Mark all images as 'Unlabeled'"
          onClick={this.markAllNotLabeled}
        />
      </div>
    );
  }
}
