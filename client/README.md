# Frontend

There are two major parts of the frontend:

- Labeling app
- Admin app

The separation is based on the user-persona. The admin app is for managing the projects, upload images, edit the labels and forms.

The Labeling part should be viewed by the whoever does the manual labor of tagging images and drawing boxes. Although the admin part of the UI is not protected with any authentication yet, the labeling UI intentionally never points back to the admin interface.
