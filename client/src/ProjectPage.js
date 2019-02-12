import React, { Component } from 'react';

import { Header, Button, Form } from 'semantic-ui-react';

import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from 'react-sortable-hoc';

import update from 'immutability-helper';
import arrayMove from 'array-move';

import ProjectImages from './ProjectImages';

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
    this.setState({
      project: update(project, {
        form: {
          formParts: {
            $splice: [
              [
                project.form.formParts.findIndex(x => x.id === oldValue.id),
                1,
                newValue,
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

  render() {
    const { match } = this.props;
    const { projectId } = match.params;

    const { error, isLoaded, project } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    }

    const items = project.form.formParts;
    const renderedItems = items.map((value, index) => (
      <SortableItem
        key={value.id}
        index={index}
        value={value}
        onChange={this.handleChange}
      />
    ));

    return (
      <div className="ui form" style={{ paddingBottom: 200 }}>
        <Form.Field
          placeholder="Project name"
          control="input"
          defaultValue={project.name}
          style={{ fontSize: 24 }}
          onChange={this.handleNameChange}
        />
        <div style={{ padding: '1em 0 110px 0' }}>
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
        <div style={{ padding: '2em 0' }}>
          <Header disabled>IMAGES</Header>
          <ProjectImages projectId={projectId} />
        </div>
        <div style={{ padding: '2em 0' }}>
          <Header disabled>UPLOAD IMAGES</Header>
        </div>
      </div>
    );
  }
}

const dragHandleStyle = {
  background:
    'linear-gradient(180deg,#000,#000 20%,#fff 0,#fff 40%,#000 0,#000 60%,#fff 0,#fff 80%,#000 0,#000)',
  width: 25,
  minWidth: 25,
  height: 20,
  opacity: 0.25,
  cursor: 'move',
};
const DragHandle = sortableHandle(({ style }) => (
  <div style={{ ...dragHandleStyle, ...style }} />
));

const SortableItem = sortableElement(({ value, onChange }) => {
  const options = [
    { key: 'bbox', text: 'Draw a bounding box', value: 'bbox' },
    { key: 'polygon', text: 'Draw a polygon figure', value: 'polygon' },
    { key: 'text', text: 'Enter a text label', value: 'text' },
  ];
  return (
    <div
      style={{
        marginTop: '0.7em',
        padding: '1em',
        border: 'solid 1px #efefef',
        background: 'white',
        shadow: 'rgb(204, 204, 204) 0px 1px 2px',
      }}
    >
      <Form className="form-card" style={{ display: 'flex' }}>
        <DragHandle style={{ flex: 0, marginRight: '0.5em', marginTop: 9 }} />
        <div style={{ flex: 1 }}>
          <Form.Field
            placeholder="Label name"
            control="input"
            defaultValue={value.name}
            style={{ padding: 3, fontSize: 24 }}
            onChange={e => onChange(value, { ...value, name: e.target.value })}
          />
          <Form.Select
            label="Label type"
            options={options}
            defaultValue={value.type}
            onChange={(e, change) =>
              onChange(value, { ...value, type: change.value })
            }
            style={{ maxWidth: 400 }}
          />
        </div>
      </Form>
    </div>
  );
});

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
