import React, { Component } from 'react';
import LabelingApp from './LabelingApp';

import { Loader } from 'semantic-ui-react';
import DocumentMeta from 'react-document-meta';

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

  componentDidMount() {
    this.refetch();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.imageId !== this.props.match.params.imageId) {
      this.refetch();
    }
  }

  async refetch() {
    this.setState({
      isLoaded: false,
      error: null,
      project: null,
      image: null,
    });

    const { match, history } = this.props;
    let { projectId, imageId } = match.params;

    try {
      const a = document.createElement('a');
      a.setAttribute('href', '/api/getLabelingInfo');
      const url = new URL(a.href);

      url.searchParams.append('projectId', projectId);
      if (imageId) {
        url.searchParams.append('imageId', imageId);
      }

      const { project, image } = await (await fetch(url)).json();

      if (!project) {
        history.replace(`/label/${projectId}/over`);
        return;
      }

      history.replace(`/label/${project.id}/${image.id}`);

      this.setState({
        isLoaded: true,
        project,
        image,
      });
    } catch (error) {
      this.setState({
        isLoaded: true,
        error,
      });
    }
  }

  async pushUpdate(labelData) {
    const { imageId } = this.props.match.params;
    await fetch('/api/images/' + imageId, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ labelData }),
    });
  }

  async markComplete() {
    const { imageId } = this.props.match.params;
    await fetch('/api/images/' + imageId, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ labeled: true }),
    });
  }

  render() {
    const { history } = this.props;
    const { project, image, isLoaded, error } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <Loader active inline="centered" />;
    }

    const title = `Image ${image.id} for project ${
      project.name
    } -- Image Labeling Tool`;

    const props = {
      onBack: () => {
        history.goBack();
      },
      onSkip: () => {
        history.push(`/label/${project.id}/`);
      },
      onSubmit: () => {
        this.markComplete();
        history.push(`/label/${project.id}/`);
      },
      onLabelChange: this.pushUpdate.bind(this),
    };

    return (
      <DocumentMeta title={title}>
        <LabelingApp
          labels={project.form.formParts}
          labelData={image.labelData}
          imageUrl={image.link}
          {...props}
        />
      </DocumentMeta>
    );
  }
}
