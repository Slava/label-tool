-- Up
create table jobs (
  id integer primary key autoincrement,
  name text not null,
  form text not null
);

create table images (
  id integer primary key autoincrement,
  originalName text not null,
  labelsCount int default 0, /* count of the completed labels */
  jobsId integer,
  constraint images_fk_jobsId foreign key (jobsId) references Jobs (id) on delete cascade
);

create table labels (
  id integer primary key autoincrement,
  jobsId integer,
  imagesId integer,
  completed boolean default false,
  constraint labels_fk_jobsId foreign key (jobsId) references Jobs (id) on delete cascade,
  constraint labels_fk_imagesId foreign key (imagesId) references Images (id) on delete cascade
);

insert into jobs (name, form) values ('Test Project', '{ "formParts": [ { "type": "polygon", "name": "Car" }, { "type": "bbox", "name": "Windows" } ] }');
insert into images (originalName, labelsCount, jobsId) values ('tesla.jpg', 0, 1);


-- Down
drop table jobs;
drop table images;
drop table labels;
