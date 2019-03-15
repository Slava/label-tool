import demoImg from './demo-assets/demo.jpg';
import semanticSegmentationResponse from './demo-assets/semantic-segmentation.json.resp';
import objectDetectionResponse from './demo-assets/object-detection.json.resp';

export const demoMocks = {
  '/api/getLabelingInfo': url => {
    const points = [
      { lat: 309.045449970124, lng: 625.3817609078532 },
      { lat: 389.39416927673574, lng: 636.0189083788734 },
      { lat: 391.74775348325585, lng: 630.3874266468058 },
      { lat: 418.2995456637876, lng: 649.6483578597326 },
      { lat: 442.7837802564911, lng: 650.5189084230287 },
      { lat: 456.5065601296597, lng: 656.2611489389324 },
      { lat: 457.14786455087716, lng: 675.4384182973803 },
      { lat: 427.1138701171609, lng: 687.190850901878 },
      { lat: 416.01435043513527, lng: 680.9881781383931 },
      { lat: 404.63825712075703, lng: 700.754498022768 },
      { lat: 348.10066020274917, lng: 706.2554371527104 },
      { lat: 307.3043488435318, lng: 713.6338242619977 },
      { lat: 297.63517780645657, lng: 707.2677077164033 },
      { lat: 301.754589002519, lng: 699.4873776084357 },
      { lat: 343.34918202031685, lng: 694.0881597393285 },
      { lat: 263.2327265766655, lng: 699.2697399676117 },
      { lat: 226.99605937946436, lng: 680.4440840363329 },
      { lat: 193.5886815129756, lng: 683.2733733670453 },
      { lat: 194.45923207627172, lng: 663.7948045132946 },
      { lat: 252.89493863752404, lng: 653.5658353945652 },
      { lat: 282.2760201487682, lng: 653.7834730353892 },
      { lat: 278.79381789558374, lng: 625.9258550099132 },
    ].map(({ lat, lng }) => ({ lat: 700 - lat, lng }));
    const points2 = [
      { lat: 200.46477246638622, lng: 770.3928381027434 },
      { lat: 202.93964620053913, lng: 761.9075567285049 },
      { lat: 213.72302461363398, lng: 760.4933431661318 },
      { lat: 226.62772337028846, lng: 764.9127605485477 },
      { lat: 275.7716446627535, lng: 754.1293821354528 },
      { lat: 344.8913325237385, lng: 759.432682994352 },
      { lat: 371.23106012293744, lng: 760.6701198614285 },
      { lat: 381.48410845014234, lng: 741.5782367693917 },
      { lat: 400.3992148468825, lng: 743.346003722358 },
      { lat: 401.63665171395894, lng: 739.2801397305354 },
      { lat: 436.28488399209976, lng: 750.9474016201134 },
      { lat: 450.6037963111274, lng: 780.1155563440585 },
      { lat: 479.41839764447917, lng: 770.5696147980401 },
      { lat: 493.9140866588034, lng: 778.7013427816854 },
      { lat: 493.3837565729135, lng: 798.853886045502 },
      { lat: 483.3074849410052, lng: 808.5766042868171 },
      { lat: 469.51890270786754, lng: 806.2785072479608 },
      { lat: 462.2710582007054, lng: 798.853886045502 },
      { lat: 450.780573006424, lng: 799.5609928266886 },
      { lat: 440.5275246792191, lng: 828.9059242459302 },
      { lat: 423.291796887797, lng: 834.386001800126 },
      { lat: 406.05606909637487, lng: 839.8660793543218 },
      { lat: 402.3437584951455, lng: 835.0931085813125 },
      { lat: 379.716341497176, lng: 842.5177297837713 },
      { lat: 355.85148763213004, lng: 844.2854967367377 },
      { lat: 346.39393443375997, lng: 847.7326422950221 },
      { lat: 343.56550730901375, lng: 844.8158268226276 },
      { lat: 325.35750769346015, lng: 846.6719821232423 },
      { lat: 319.9658184869127, lng: 841.4570696119915 },
      { lat: 324.38523586932865, lng: 826.607827207074 },
      { lat: 336.59783310277044, lng: 834.731484905481 },
      { lat: 352.07604580659114, lng: 835.3908786715936 },
      { lat: 369.1758521514147, lng: 829.5128759753552 },
      { lat: 386.2756584962383, lng: 823.6348732791167 },
      { lat: 353.38624554456584, lng: 822.2353237918115 },
      { lat: 317.69773361828294, lng: 825.2676810143062 },
      { lat: 253.50359574886406, lng: 826.0655287481668 },
      { lat: 204.2428073372761, lng: 815.8344419242217 },
      { lat: 190.22242909705494, lng: 826.0655287481668 },
      { lat: 186.85493641000312, lng: 813.560867074456 },
      { lat: 189.08564167217213, lng: 801.0562054007453 },
      { lat: 194.76957879658613, lng: 795.7511974179589 },
      { lat: 258.42967459002284, lng: 804.087638533766 },
      { lat: 316.7847624006732, lng: 795.3722682763313 },
      { lat: 274.99975551549045, lng: 781.1453633343426 },
      { lat: 238.34643008376008, lng: 783.2465357442481 },
    ].map(({ lat, lng }) => ({ lat: 700 - lat, lng }));
    return {
      ok: true,
      status: 200,
      json: async () => {
        return {
          project: {
            id: 'demo',
            name: 'Test Project',
            referenceText: null,
            referenceLink: null,
            form: {
              formParts: [
                {
                  id: 'mzs64divv',
                  name: 'Human',
                  type: 'polygon',
                },
                {
                  id: 'ywx7emnqc',
                  name: 'Shoes',
                  type: 'bbox',
                },
                {
                  id: 'qvjf23y51',
                  name: 'Image quality',
                  type: 'select-one',
                  options: ['Bad', 'Okay', 'Excellent'],
                },
              ],
            },
          },
          image: {
            id: 1,
            originalName: 'demo.jpg',
            link: demoImg,
            externalLink: null,
            localPath: null,
            labeled: 0,
            labelData: {
              labels: {
                mzs64divv: [
                  {
                    id: 'hpctbyvju7k5t68znsphx3',
                    type: 'polygon',
                    points,
                    tracingOptions: {
                      trace: [],
                      enabled: false,
                      smoothing: 1.2,
                    },
                  },
                  {
                    id: 'hpctbyvju7k5t68znsphx4',
                    type: 'polygon',
                    points: points2,
                    tracingOptions: {
                      trace: [],
                      enabled: false,
                      smoothing: 1.2,
                    },
                  },
                ],
              },
            },
            lastEdited: 1552629203129,
            projectsId: 'demo',
          },
        };
      },
    };
  },
  '/api/mlmodels': () => {
    return {
      ok: 1,
      status: 200,
      json: async () => [
        {
          id: 1,
          name: 'object detection - faster_rcnn',
          url: 'http://someserver.com/v1/models/faster_rcnn:predict',
          type: 'object_detection',
        },
        {
          id: 2,
          name: 'semantic segmentation - deeplabv3',
          url:
            'http://someserver.com/v1/models/deeplabv3plus_xception65:predict',
          type: 'semantic_segmentation',
        },
      ],
    };
  },
  '/api/mlmodels/1': () => {
    return fetch(objectDetectionResponse);
  },
  '/api/mlmodels/2': () => {
    return fetch(semanticSegmentationResponse);
  },
  '/api/images/1': () => {
    return {
      ok: 1,
      status: 200,
    };
  },
};
