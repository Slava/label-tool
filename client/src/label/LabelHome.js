import React, { Component } from 'react';

import Menubar from '../common/Menubar';
import ProjectsGrid from '../common/ProjectsGrid';

export default class LabelHome extends Component {
  render() {
    return (
      <Menubar active="label">
        <ProjectsGrid
          title="Start Labeling:"
          linkPrefix="/label/"
          newButton={false}
        />
      </Menubar>
    );
  }
}
