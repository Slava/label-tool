import React, { Component } from 'react';
import { Link, Route } from 'react-router-dom';
import {
  Header,
  Card,
  Container,
  Menu,
  Grid,
  Button,
  Form,
} from 'semantic-ui-react';
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from 'react-sortable-hoc';

import update from 'immutability-helper';
import arrayMove from 'array-move';

import './AdminApp.css';

class AdminApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      projects: [],
    };

    this.onNewProject = this.onNewProject.bind(this);
  }

  async componentDidMount() {
    try {
      const projects = await (await fetch('/api/projects/')).json();
      this.setState({
        isLoaded: true,
        projects,
      });
    } catch (error) {
      this.setState({
        isLoaded: true,
        error,
      });
    }
  }

  async onNewProject() {
    const newProjectRes = await fetch('/api/projects', { method: 'POST' });
    const newProject = await newProjectRes.json();
    this.setState({
      projects: this.state.projects.concat([newProject]),
    });
  }

  render() {
    const { error, isLoaded, projects } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    }

    const renderProjectCard = project => {
      const { id, name, form, imagesCount, labelsCount } = project;
      const info = `${imagesCount} images, ${labelsCount} labeled`;
      const desc = `Tags: ${form.formParts.map(part => part.name).join(', ')}`;
      return (
        <Grid.Column key={id}>
          <Link to={`/admin/${id}`}>
            <Card fluid link header={name} meta={info} description={desc} />
          </Link>
        </Grid.Column>
      );
    };

    const renderProjectsGrid = () => (
      <Grid stackable columns={2}>
        {projects.map(renderProjectCard)}
        <Grid.Column>
          <Button style={{ padding: '1.5em' }} onClick={this.onNewProject}>
            <span style={{ fontSize: '4em' }}>+</span>
            <div>Make a new project</div>
          </Button>
        </Grid.Column>
      </Grid>
    );

    return (
      <div>
        <Menu inverted>
          <Link to="/admin/">
            <Menu.Item header>Image Labeling</Menu.Item>
          </Link>
          <Link to="/admin/">
            <Menu.Item name="projects" />
          </Link>
          <Link to="/">
            <Menu.Item name="labeling interface" />
          </Link>
        </Menu>
        <Container>
          <Route exact path="/admin/" component={renderProjectsGrid} />
          <Route path="/admin/:projectId" component={ProjectPage} />
        </Container>
      </div>
    );
  }
}

class ProjectPage extends Component {
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

    return (
      <div className="ui form">
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
            {items.map((value, index) => (
              <SortableItem
                key={value.id}
                index={index}
                value={value}
                onChange={this.handleChange}
              />
            ))}
          </SortableContainer>
          <Button
            circular
            icon="plus"
            size="massive"
            style={{ float: 'right', marginTop: '2em' }}
            onClick={this.handleNew}
          />
        </div>
        <div />
        <Header disabled>IMAGES</Header>
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

export default AdminApp;
