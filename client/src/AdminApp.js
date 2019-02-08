import React, { Component } from 'react';
import { Link, Route } from 'react-router-dom';
import { Card, Container, Menu, Grid, Button, Form } from 'semantic-ui-react';
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from 'react-sortable-hoc';

import arrayMove from 'array-move';

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
      const info = `${imagesCount} images, ${labelsCount} labels`;
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
          <Menu.Item header>Image Labeling</Menu.Item>
          <Menu.Item name="projects" />
          <Menu.Item name="labeling interface" />
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
      <Form size="massive">
        <Form.Field
          placeholder="Project name"
          control="input"
          defaultValue={project.name}
        />
        <SortableContainer onSortEnd={this.onSortEnd} useDragHandle>
          {items.map((value, index) => (
            <SortableItem key={`item-${index}`} index={index} value={value} />
          ))}
        </SortableContainer>
      </Form>
    );
  }
}

const DragHandle = sortableHandle(() => <span>::</span>);

const SortableItem = sortableElement(({ value }) => (
  <Container>
    <DragHandle />
    {value.name}
  </Container>
));

const SortableContainer = sortableContainer(({ children }) => {
  return <div>{children}</div>;
});

export default AdminApp;
