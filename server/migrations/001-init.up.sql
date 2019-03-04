create table Projects (
  id integer primary key autoincrement,
  name text not null,
  referenceText,
  referenceLink,
  form text not null
);

create table Images (
  id integer primary key autoincrement,
  originalName text not null,
  link text not null,
  externalLink text,
  localPath text,
  labeled boolean,
  labelData text not null, /* JSON-stringified data, matching the form data in the project */
  lastEdited real default 0.0,
  projectsId integer,
  constraint images_fk_projectsId foreign key (projectsId) references Projects (id) on delete cascade
);

create table MLModels (
  id integer primary key autoincrement,
  name text not null,
  url text not null,
  type text not null
);

insert into projects (name, form) values ('Test Project', '{ "formParts": [ { "type": "polygon", "name": "Car", "id": "nfjxui" }, { "type": "bbox", "name": "Windows", "id": "n3ndi88" } ] }');
insert into images (originalName, link, labeled, labelData, projectsId) values ('tesla.jpg', '/uploads/1/1.jpg', 0, '{ }', 1);
