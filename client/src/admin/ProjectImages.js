import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Table, Loader, Header } from 'semantic-ui-react';

export default class ProjectImages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      images: [],
    };
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

  render() {
    const { error, isLoaded, images } = this.state;
    const { projectId } = this.props;

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
      return image.labels.map(label => (
        <span key={label.id} style={{ marginLeft: 5 }}>
          <Link to={`/${projectId}/${label.id}/`}>{label.id}</Link>
        </span>
      ));
    };

    const renderedRows = images.map(image => (
      <Table.Row key={image.id}>
        <Table.Cell>{image.id}</Table.Cell>
        <Table.Cell>
          <a href={image.link}>{image.originalName}</a>
        </Table.Cell>
        <Table.Cell>{renderLabelLinks(image)}</Table.Cell>
      </Table.Row>
    ));

    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>ID</Table.HeaderCell>
            <Table.HeaderCell>Image Link</Table.HeaderCell>
            <Table.HeaderCell>Labeled</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>{renderedRows}</Table.Body>
      </Table>
    );
  }
}
