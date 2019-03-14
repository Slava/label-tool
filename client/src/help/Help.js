import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import DocumentMeta from 'react-document-meta';

import { Header, Container, List, Icon, Label } from 'semantic-ui-react';

import Menubar from '../common/Menubar';

import labelingInterfaceAnnotatedImg from './tutorial/labeling-interface-annotated.png';
import labelsImg from './tutorial/labels.png';
import bboxLabelingImg from './tutorial/bbox-labeling.gif';
import polygonLabelingImg from './tutorial/polygon-labeling.gif';
import addNewPointImg from './tutorial/add-new-point.png';
import showAndHideLayerImg from './tutorial/show-and-hide-layer.gif';
import changeLayerImg from './tutorial/change-layer.gif';
import autoTracingImg from './tutorial/auto-tracing.gif';
import navImg from './tutorial/nav.png';
import toolbarImg from './tutorial/toolbar.png';
import mlObjectDescriptionImg from './tutorial/ml-object-description.gif';
import mlObjectDetectionImg from './tutorial/ml-object-detection.gif';
import mlSemanticSegmentationImg from './tutorial/ml-semantic-segmentation.gif';

function Img({ src, caption }) {
  return (
    <figure style={{ textAlign: 'center', margin: '1em 1em' }}>
      <img src={src} alt={caption} />
      <figcaption style={{ color: '#999', fontSize: '12px' }}>
        {caption}
      </figcaption>
    </figure>
  );
}

const sections = [
  {
    id: 'labeling',
    title: 'How to label',
    comp: () => {
      return (
        <div>
          <Header as="h1">How To Label</Header>
          <p>
            The labeling interface presents the user with a canvas to create and
            edit figures overlayed over the image being labeled and the list of
            labels on the left.
          </p>
          <Img
            src={labelingInterfaceAnnotatedImg}
            caption="Labeling Interface"
          />

          <p>
            Let's examine the sidebar in detail. Each label has a shortcut and a
            color associated with it. The shortcut is usually a number in the
            1-9 range. If it is a figure label, pressing the shortcut will
            activate the drawing mode for the label with the given color.
          </p>
          <p>
            The icon next to the label name indicates a figure label. The{' '}
            <Icon name="pencil" /> pencil icon indicates a polygon label and the
            overlapping boxes <Icon name="object ungroup" /> indicate a bounding
            box.
          </p>
          <Img
            src={labelsImg}
            caption="Sidebar with labels and visibility toggles"
          />
          <p>
            The toggleable <Icon name="eye" /> eye icon allows to hide or show
            all figures belonging to the label in the segmentation area.
          </p>
          <Img
            src={showAndHideLayerImg}
            caption="Toggle the eye icon to change the visibility of some label's figures"
          />

          <Header as="h2">Adding a New Figure</Header>
          <p>
            Start by clicking on a label on the left that is marked either as a
            polygon label (<Icon name="pencil" /> pencil icon) or as a bounding
            box label (<Icon name="object ungroup" /> box icon).
          </p>
          <p>
            After selecting a drawing label, you can start outlining a figure by
            clicking on the segmentation area.
          </p>
          <Img
            src={bboxLabelingImg}
            caption="Adding a figure for a bounding box label"
          />
          <Img
            src={polygonLabelingImg}
            caption="Adding a figure for a polygon label"
          />

          <Header as="h2">Editing a Figure</Header>
          <p>
            To edit a figure click on it to select. Now you can move points by
            dragging them with your mouse.
          </p>
          <p>To delete a point, click on it once.</p>
          <p>
            To add a new point, click on the transparent white point on the edge
            where you want the new point to be added. Sometimes if two points
            are too close to each other, you would need to zoom in more to see
            the transparent white point.
          </p>
          <Img src={addNewPointImg} caption="Adding a new point to a figure" />

          <Header as="h2">Reassigning a Figure to a Different Label</Header>
          <p>
            To change the label for a figure, select the figure, then press the{' '}
            <Label as="span">c</Label> key (shortcut for "change"). Then select
            the new label on the sidebar on the left. You can only select
            another label of the same type (so you can only change polygons to
            other polygon labels, for example).
          </p>
          <Img
            src={changeLayerImg}
            caption="Changing the label from green to blue using the 'c' shortcut key"
          />

          <Header as="h2">Sumitting the Labeled Image</Header>
          <p>
            After you are done labeling the image, click the "Submit" button on
            the sidebar to mark the image as "labeled" and load the next
            labeling task for the project.
          </p>
          <Img
            src={navImg}
            caption="The buttons on the bottom of the sidebar used to get the next labeling task"
          />
          <p>
            Click "Skip" to load a new task without marking the current image as
            labeled, the labeling progress will be preserved and the image will
            be assigned again later (possibly to someone else).
          </p>
          <p>
            Every image has a timer. When the time expires, the current labeler
            is assumed to be idle and the image can get assigned to another
            labeler. Every time the labels are edited, image's timer is renewed.
          </p>
        </div>
      );
    },
  },
  {
    id: 'labeling-advanced',
    title: 'Advanced Labeling',
    comp: () => {
      return (
        <div>
          <Header as="h1">Advanced Labeling Features</Header>
          <p>
            As you get a hang of labeling images there are a couple of more
            advanced features you could use to make labeling faster.
          </p>
          <Header as="h2">Using Auto-Tracing</Header>
          <p>
            Sometimes when you need to make a complicated selection following
            winding paths you could make use of the auto-tracing feature.{' '}
          </p>
          <p>
            Activate auto-tracing for a polygon figure after selecting one. On
            the toolbar you can configure the algorithm parameters that suit
            your selection best.
          </p>
          <Img
            src={toolbarImg}
            caption="Toolbar with the ML-based assistance options"
          />
          <Img
            src={autoTracingImg}
            caption="Using the auto-tracing feature we can make a more complex selection with fewer clicks"
          />

          <Header as="h2">Using ML Models</Header>
          <p>
            There are 3 types of ML Model-based assistance supported. Object
            detection and semantic segmentation models can be used to
            automatically generate the figures unlabeled. The object description
            models can be used to generate an input for a text field-based
            label.
          </p>

          <p>
            Generally, the figure-generating models can be called from the
            toolbar that becomes avialabe once one or more ML Models are added
            in the admin interface.
          </p>
          <p>
            After generating figures you might want to delete the unwanted ones
            (by selecting them and pressing the <Label>Delete</Label> button) or
            edit the generated paths.
          </p>

          <Img
            src={mlObjectDetectionImg}
            caption="Generating bounding boxes using Object Detection type"
          />
          <Img
            src={mlSemanticSegmentationImg}
            caption="Generating polygons using Semantic Segmentation type"
          />
          <Img
            src={mlObjectDescriptionImg}
            caption="Filling in text inputs using Object Description type"
          />
        </div>
      );
    },
  },
  {
    id: 'admin',
    title: 'Managing Projects',
    comp: () => {
      return <div />;
    },
  },
];

export default class Help extends Component {
  render() {
    const links = sections.map(section => (
      <List.Item key={section.id}>
        <Link to={'/help/' + section.id}>{section.title}</Link>
      </List.Item>
    ));

    const renderer = ({ match: { params } }) => {
      const Comp = sections.find(({ id }) => id === params.id).comp;
      return <Comp />;
    };

    const exactRenderer = ({ history }) => {
      history.replace('/help/labeling');
      return null;
    };

    return (
      <Menubar active="help">
        <DocumentMeta title="Help -- Image Labeling Tool">
          <div className="help-body" style={{ display: 'flex', marginTop: 30 }}>
            <List style={{ width: 150, minHeight: 500 }}>{links}</List>
            <Container text style={{ width: '100%', paddingBottom: '5em' }}>
              <Route path="/help/:id" render={renderer} />
              <Route exact path="/help" render={exactRenderer} />
            </Container>
          </div>
        </DocumentMeta>
      </Menubar>
    );
  }
}
