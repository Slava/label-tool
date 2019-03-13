import React, { Component } from 'react';

import {
  Header,
  Button,
  Loader,
  Input,
  List,
  Segment,
} from 'semantic-ui-react';

import DocumentMeta from 'react-document-meta';

import { sortableContainer, sortableElement } from 'react-sortable-hoc';

import update from 'immutability-helper';
import arrayMove from 'array-move';

import ProjectImages from './ProjectImages';
import UploadImages from './UploadImages';
import LabelFormItem from './LabelFormItem';
import UploadReference from './UploadReference';
import MLAssist from './MLAssist';

export default class ProjectPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      project: null,
    };

    this.onSortEnd = this.onSortEnd.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleNew = this.handleNew.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleReferenceChange = this.handleReferenceChange.bind(this);
  }

  async componentDidMount() {
    const { match } = this.props;
    const { projectId } = match.params;
    try {
      const project = await (await fetch('/api/projects/' + projectId)).json();
      this.setState({
        isLoaded: true,
        project,
      });
    } catch (error) {
      this.setState({
        isLoaded: true,
        error,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { project } = this.state;
    if (!project) return;
    const { projectId } = this.props.match.params;

    if (prevState.project !== project) {
      fetch('/api/projects/' + projectId, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
        body: JSON.stringify({ project }),
      });
    }
  }

  onSortEnd({ oldIndex, newIndex }) {
    this.setState(({ project }) => ({
      project: update(project, {
        form: {
          formParts: {
            $set: arrayMove(project.form.formParts, oldIndex, newIndex),
          },
        },
      }),
    }));
  }

  handleChange(oldValue, newValue) {
    const { project } = this.state;
    const edit = newValue ? [1, newValue] : [1];
    this.setState({
      project: update(project, {
        form: {
          formParts: {
            $splice: [
              [
                project.form.formParts.findIndex(x => x.id === oldValue.id),
                ...edit,
              ],
            ],
          },
        },
      }),
    });
  }

  handleNew() {
    const { project } = this.state;
    this.setState({
      project: update(project, {
        form: {
          formParts: {
            $push: [newFormPart()],
          },
        },
      }),
    });
  }

  handleNameChange(e) {
    const { value } = e.target;
    const { project } = this.state;
    this.setState({
      project: update(project, {
        name: {
          $set: value,
        },
      }),
    });
  }

  handleReferenceChange({ referenceLink, referenceText }) {
    const { project } = this.state;
    this.setState({
      project: update(project, {
        referenceText: {
          $set: referenceText,
        },
        referenceLink: {
          $set: referenceLink,
        },
      }),
    });
  }

  render() {
    const { match } = this.props;
    const { projectId } = match.params;

    const { error, isLoaded, project } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <Loader active inline="centered" />;
    }

    const items = project.form.formParts;
    const renderedItems = items.length ? (
      items.map((value, index) => (
        <SortableItem
          key={value.id}
          index={index}
          value={value}
          onChange={this.handleChange}
        />
      ))
    ) : (
      <Header className="centered" as="h5">
        No labels, add labels using the plus button below
      </Header>
    );

    return (
      <DocumentMeta title={`Edit project ${project.name}`}>
        <div style={{ display: 'flex' }}>
          <div className="ui" style={{ paddingBottom: 200, flex: 1 }}>
            <Input
              placeholder="Project name"
              control="input"
              defaultValue={project.name}
              style={{ fontSize: 24, width: '100%', marginTop: 10 }}
              onChange={this.handleNameChange}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'row-reverse',
                marginTop: 5,
              }}
            >
              <Input
                label="Labeling link"
                value={window.location.origin + '/label/' + projectId}
                onClick={e => e.target.select()}
              />
            </div>
            <div id="labels" style={{ padding: '2em 0 110px 0' }}>
              <Header disabled>LABELS</Header>
              <SortableContainer onSortEnd={this.onSortEnd} useDragHandle>
                {renderedItems}
              </SortableContainer>
              <Button
                circular
                icon="plus"
                size="massive"
                style={{ float: 'right', marginTop: '2em' }}
                onClick={this.handleNew}
              />
            </div>
            <div id="images" style={{ padding: '2em 0' }}>
              <Header disabled>IMAGES</Header>
              <ProjectImages
                projectId={projectId}
                refetchRef={f => this.setState({ handleImagesChange: f })}
              />
            </div>
            <div id="upload-images" style={{ padding: '2em 0' }}>
              <Header disabled>UPLOAD IMAGES</Header>
              <UploadImages
                projectId={projectId}
                onChange={this.state.handleImagesChange}
              />
            </div>
            <div id="export-data" style={{ padding: '2em 0' }}>
              <Header disabled>EXPORT DATA</Header>
              <a href={`/api/projects/${projectId}/export`}>
                <Button
                  icon="download"
                  label="Download a zip-file with JSON-encoded labels"
                />
              </a>
            </div>
            <div id="reference-information" style={{ padding: '2em 0' }}>
              <Header disabled>REFERENCE INFORMATION</Header>
              <UploadReference
                project={project}
                onChange={this.handleReferenceChange}
                onUpload={() => this.componentDidMount()}
              />
            </div>
            <div id="ml-assistance" style={{ padding: '2em 0' }}>
              <Header disabled>ML ASSISTANCE MODELS</Header>
              <MLAssist />
            </div>
          </div>
          <Segment
            style={{
              flex: '0 0 auto',
              width: 200,
              position: 'sticky',
              top: 65,
              alignSelf: 'flex-start',
              marginTop: 0,
              marginLeft: 30,
              boxShadow: '0 0 #FFFFFF',
            }}
          >
            <Header as="h4">On this page:</Header>
            <List>
              <List.Item>
                <a href="#labels">Labels</a>
              </List.Item>
              <List.Item>
                <a href="#images">Images</a>
              </List.Item>
              <List.Item>
                <a href="#upload-images">Upload Images</a>
              </List.Item>
              <List.Item>
                <a href="#import-data">Import data</a>
              </List.Item>
              <List.Item>
                <a href="#export-data">Export data</a>
              </List.Item>
              <List.Item>
                <a href="#reference-information">Reference Info</a>
              </List.Item>
              <List.Item>
                <a href="#ml-assistance">ML Assistance</a>
              </List.Item>
            </List>
          </Segment>
        </div>
      </DocumentMeta>
    );
  }
}

const SortableItem = sortableElement(LabelFormItem);

const SortableContainer = sortableContainer(({ children }) => {
  return <div>{children}</div>;
});

const newFormPart = () => {
  const id = Math.random()
    .toString(36)
    .substr(2, 9);
  return {
    id,
    name: 'New label',
    type: 'bbox',
  };
};
