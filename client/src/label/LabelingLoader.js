import React, { Component } from 'react';
import LabelingApp from './LabelingApp';

import { Loader } from 'semantic-ui-react';

export default class LabelingLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      project: null,
      image: null,
      isLoaded: false,
      error: null,
    };
  }

  async componentDidMount() {
    const { match } = this.props;
    let { projectId, imageId, labelId } = match.params;

    try {
      const a = document.createElement('a');
      a.setAttribute('href', '/api/getLabelingInfo');
      const url = new URL(a.href);

      url.searchParams.append('projectId', projectId);
      if (imageId) {
        url.searchParams.append('imageId', imageId);
        if (imageId) {
          url.searchParams.append('labelId', labelId);
        }
      }

      const { project, image, label } = await (await fetch(url)).json();
      console.log(project, image, label);

      this.setState({
        isLoaded: true,
        project,
        image,
        label,
      });
    } catch (error) {
      this.setState({
        isLoaded: true,
        error,
      });
    }
  }

  render() {
    const { project, image, label, isLoaded, error } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <Loader active inline="centered" />;
    }

    return (
      <LabelingApp labels={project.form.formParts} imageUrl={image.link} />
    );
  }
}
