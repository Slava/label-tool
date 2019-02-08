import React, { Component } from 'react';
import { Card, Container, Menu, Grid, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

class AdminApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      projects: [],
    };
  }

  componentDidMount() {
    fetch('/api/projects/')
      .then(res => res.json())
      .then(
        result => {
          this.setState({
            isLoaded: true,
            projects: result,
          });
        },
        error => {
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );
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
      const parsed = JSON.parse(form);
      const info = `${imagesCount} images, ${labelsCount} labels`;
      const desc = `Tags: ${parsed.formParts
        .map(part => part.name)
        .join(', ')}`;
      return (
        <Grid.Column key={id}>
          <Link to={`/admin/${id}`}>
            <Card fluid link header={name} meta={info} description={desc} />
          </Link>
        </Grid.Column>
      );
    };

    return (
      <div>
        <Menu inverted>
          <Menu.Item header>Images Labeling</Menu.Item>
          <Menu.Item name="projects" />
          <Menu.Item name="labeling interface" />
        </Menu>
        <Container>
          <Grid stackable columns={2}>
            {projects.map(renderProjectCard)}
            <Grid.Column>
              <Button style={{ padding: '1.5em' }}>
                <span style={{ fontSize: '4em' }}>+</span>
                <div>Make a new project</div>
              </Button>
            </Grid.Column>
          </Grid>
        </Container>
      </div>
    );
  }
}

export default AdminApp;
