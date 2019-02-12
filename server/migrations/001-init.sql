-- Up
create table Projects (
  id integer primary key autoincrement,
  name text not null,
  form text not null
);

create table Images (
  id integer primary key autoincrement,
  originalName text not null,
  link text not null,
  labelsCount int default 0, /* count of the completed labels */
  projectsId integer,
  constraint images_fk_projectsId foreign key (projectsId) references Projects (id) on delete cascade
);

create table Labels (
  id integer primary key autoincrement,
  projectsId integer,
  imagesId integer,
  completed boolean default false,
  labelData text not null, /* JSON-stringified data */
  constraint labels_fk_projectsId foreign key (projectsId) references Projects (id) on delete cascade,
  constraint labels_fk_imagesId foreign key (imagesId) references Images (id) on delete cascade
);

insert into projects (name, form) values ('Test Project', '{ "formParts": [ { "type": "polygon", "name": "Car", "id": "nfjxui" }, { "type": "bbox", "name": "Windows", "id": "n3ndi88" } ] }');
insert into images (originalName, link, labelsCount, projectsId) values ('tesla.jpg', '/uploads/1/1.jpg', 0, 1);
insert into labels (projectsId, imagesId, completed, labelData) values (1, 1, 0, '{}');
insert into labels (projectsId, imagesId, completed, labelData) values (1, 1, 0, '{}');
insert into labels (projectsId, imagesId, completed, labelData) values (1, 1, 0, '{}');


-- Down
drop table Projects;
drop table Images;
drop table Labels;
