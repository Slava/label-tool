import React, { Component } from 'react';
import { Link, Route } from 'react-router-dom';

import { Card, Container, Menu, Grid, Button } from 'semantic-ui-react';

import './AdminApp.css';
import ProjectPage from './ProjectPage';

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
      <div style={{ background: '#f7f7f7' }}>
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

export default AdminApp;
