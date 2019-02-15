import React, { Component } from 'react';

import { Header } from 'semantic-ui-react';

import Menubar from '../common/Menubar';
import ProjectsGrid from '../common/ProjectsGrid';

export default class LabelHome extends Component {
  render() {
    return (
      <Menubar>
        <Header as="h1">Start labeling:</Header>
        <ProjectsGrid linkPrefix="/label/" newButton={false} />
      </Menubar>
    );
  }
}
