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
      label: null,
      isLoaded: false,
      error: null,
    };
  }

  componentDidMount() {
    this.refetch();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.labelId !== this.props.match.params.labelId) {
      this.refetch();
    }
  }

  async refetch() {
    this.setState({
      isLoaded: false,
      error: null,
      project: null,
      image: null,
      label: null,
    });

    const { match, history } = this.props;
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
      history.replace(`/label/${project.id}/${image.id}/${label.id}`);

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
    const { history } = this.props;
    const { project, image, label, isLoaded, error } = this.state;

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
        history.push(`/label/${project.id}/`);
      },
    };

    return (
      <DocumentMeta title={title}>
        <LabelingApp
          labels={project.form.formParts}
          imageUrl={image.link}
          {...props}
        />
      </DocumentMeta>
    );
  }
}
