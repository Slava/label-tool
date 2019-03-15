import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import DocumentMeta from 'react-document-meta';

import { Header, List, Icon, Label } from 'semantic-ui-react';

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

import projectPageImg from './tutorial/project-page.png';
import projectImagesImg from './tutorial/project-images.png';
import projectDataImg from './tutorial/project-data.png';
import projectReferenceImg from './tutorial/project-reference.png';
import projectReferenceInterfaceImg from './tutorial/project-reference-interface.png';
import projectMlAssistImg from './tutorial/project-ml-assist.png';

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
    title: 'How To Label',
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
      return (
        <div>
          <Header as="h1">Managing Projects</Header>
          <p>
            After creating a project on the{' '}
            <Link to="/admin">admin panel page</Link> you can edit project's
            details, edit the labels, upload new images, export or import the
            labeling data etc.
          </p>

          <p>
            You can add a variety of label types, either for image segmentation
            (bounding box, polygon) or textual information (text input, multiple
            choice, single choice). Drag the label handles to reorder. Renaming
            a label doesn't change its internal representation id.
          </p>

          <Img
            src={projectPageImg}
            caption="The project page allows you to edit its name, and edit the labels"
          />

          <Header as="h2">Images</Header>
          <p>
            Next, you can manage all your images, see which ones are labeled,
            open or delete individual ones.
          </p>
          <Img
            src={projectImagesImg}
            caption="Images management part of the project"
          />

          <Header as="h2">Data Management</Header>
          <p>
            Following there are the areas where you can: upload images, import
            labeling data from tools like{' '}
            <a href="https://github.com/wkentaro/labelme">LabelMe</a>, or export
            your labeling data in the same format.
          </p>

          <p>
            When uploading images from disk, they are stored internally on the
            server's filesystem. If the other methods are used (URLs, local
            filesystem path) the files are proxied and never stored internally.
          </p>
          <Img
            src={projectDataImg}
            caption="Upload, import or export your data"
          />
        </div>
      );
    },
  },
  {
    id: 'admin-advanced',
    title: 'Configuring Advanced Features',
    comp: () => {
      return (
        <div>
          <Header as="h1">Configuring Advanced Features</Header>
          <p>
            There are a couple of features that are more specific to use-cases
            and tasks this app was designed for originally.
          </p>
          <Header as="h2">Reference Information</Header>
          <p>
            Sometimes the classification task becomes subjective and some
            instruction text or a reference image is helpful to display to the
            labelers. For this reason, you can upload a reference image and add
            a caption text with necessary instructions that will appear on top
            of the labeling interface.
          </p>
          <Img
            src={projectReferenceImg}
            caption="Adding a reference image and text for a project as an admin"
          />
          <Img
            src={projectReferenceInterfaceImg}
            caption="What a reference image looks like when displayed for the labelers"
          />

          <Header as="h2">Configuring ML-assisted Features</Header>
          <p>
            On the bottom of a project page, you can add end-points to the{' '}
            <a href="https://www.tensorflow.org/tfx/guide/serving">
              TensorFlow Serving-style
            </a>{' '}
            services. For all types of services the image is sent a s
            base64-encoded png image and depending on the type of the service
            the app expects a response in a different format. The examples of
            the request/response exchange are displayed according to the
            selected type.
          </p>

          <Img
            src={projectMlAssistImg}
            caption="Adding end-points to ML services"
          />
        </div>
      );
    },
  },
  {
    id: 'security',
    title: 'Security',
    comp: () => {
      return (
        <div>
          <Header as="h1">Security</Header>
          <p>
            There is <b>no security</b> in the current iteration of the app.
            There are no user-based permissions, all pages are accessible by
            anyone.
          </p>
          <p>
            Since this app was originally designed to be used internally, on a
            virtual private network (local to your corporation or a research
            group) this project currently lacks features that would make it a
            fully-fledged service like{' '}
            <a href="https://www.labelbox.com/">LabelBox</a>.
          </p>
        </div>
      );
    },
  },
];

export default class Help extends Component {
  render() {
    const links = sections.map(section => (
      <List.Item key={section.id}>
        <List.Icon name="circle" style={{ opacity: 0.0 }} />
        <List.Content>
          <Link to={'/help/' + section.id}>{section.title}</Link>
        </List.Content>
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
            <List style={{ maxWidth: 200, minHeight: 500 }}>
              <List.Item>
                <List.Icon name="align left" />
                <List.Content>
                  <Header as="h4">Table of Contents</Header>
                </List.Content>
              </List.Item>
              {links}
            </List>
            <div style={{ flex: 1, paddingBottom: '5em', margin: '0 90px' }}>
              <Route path="/help/:id" render={renderer} />
              <Route exact path="/help" render={exactRenderer} />
            </div>
          </div>
        </DocumentMeta>
      </Menubar>
    );
  }
}
