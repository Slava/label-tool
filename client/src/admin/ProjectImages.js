import React, { Component } from 'react';

import { Loader, Checkbox, Button, Header, Table } from 'semantic-ui-react';

import { AutoSizer, List } from 'react-virtualized';

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

    return (
      <div className="project-images">
        <Table
          celled
          style={{ display: 'flex', flexDirection: 'column', height: 600 }}
        >
          <Table.Header style={{ flex: '0 0 auto' }}>
            <Table.Row style={{ display: 'flex', background: '#f9fafb' }}>
              <Table.HeaderCell style={columnStyles[0]}>ID</Table.HeaderCell>
              <Table.HeaderCell style={columnStyles[1]}>
                Image Link
              </Table.HeaderCell>
              <Table.HeaderCell style={columnStyles[2]}>
                Label Status
              </Table.HeaderCell>
              <Table.HeaderCell style={columnStyles[3]}>
                Actions
              </Table.HeaderCell>
              {/* extra header cell to even out the width with a fake scrollbar */}
              <Table.HeaderCell
                style={{
                  flex: '0 0 auto',
                  opacity: 0,
                  overflowY: 'scroll',
                  padding: 0,
                  border: 0,
                }}
              />
            </Table.Row>
          </Table.Header>
          <Table.Body style={{ height: '100%', flex: 1, outline: 0 }}>
            <AutoSizedList
              rowHeight={55}
              rowCount={images.length}
              rowRenderer={({ index, style, key }) => (
                <Row
                  key={key}
                  style={style}
                  image={images[index]}
                  projectId={projectId}
                  onLabeled={this.handleLabeled}
                  onDelete={this.handleDelete}
                />
              )}
              overscanRowCount={10}
            />
          </Table.Body>
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

const columnStyles = [
  { flex: '0 0 80px', lineHeight: '32px' },
  { flex: '1', lineHeight: '32px' },
  { flex: '0 0 120px', lineHeight: '32px' },
  { flex: '0 0 250px', lineHeight: '32px' },
];
const Row = ({ image, projectId, style, onLabeled, onDelete }) => (
  <Table.Row style={{ ...style, display: 'flex' }}>
    <Table.Cell style={columnStyles[0]}>{image.id}</Table.Cell>
    <Table.Cell style={columnStyles[1]}>
      <a href={image.link}>{image.originalName}</a>
    </Table.Cell>
    <Table.Cell style={columnStyles[2]}>
      <Checkbox
        checked={!!image.labeled}
        label="Labeled"
        onChange={(e, { checked }) => onLabeled(image.id, checked)}
      />
    </Table.Cell>
    <Table.Cell style={columnStyles[3]}>
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
          onClick={() => onDelete(image.id)}
        />
      </div>
    </Table.Cell>
  </Table.Row>
);

const AutoSizedList = props => (
  <AutoSizer>
    {({ height, width }) => <List height={height} width={width} {...props} />}
  </AutoSizer>
);
