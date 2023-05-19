-- create table "user"
-- (
-- 	"id" varchar(36) primary key,
-- 	"name" varchar(100) not null unique,
-- 	"login" varchar(100) not null unique,
-- 	"password" varchar(255) not null
-- );

-- create table "entity"
-- (
-- 	"id" varchar(36) primary key,
--     "name" varchar(100) not null unique,
--     "systemName" varchar(200) not null unique
-- );

-- create table "object"
-- (
-- 	"id" varchar(36) primary key,
--     "name" varchar(100) not null unique,
-- 	"entity" varchar(36) not null,
--     FOREIGN KEY ("entity") REFERENCES "entity" ("id")
-- );

-- create table "dataType"
-- (
-- 	"id" varchar(36) primary key,
-- 	"code" varchar(50) not null unique,
--     "name" varchar(50) not null unique
-- );

-- create table "property"
-- (
-- 	"id" varchar(36) primary key,
--     "name" varchar(100) not null,
-- 	"systemName" varchar(200) not null,
-- 	"entity" varchar(36) not null,
--     "dataType" varchar(50) not null,
-- 	"isNull" boolean,
--     FOREIGN KEY ("entity")  REFERENCES "entity" ("id"),
--     FOREIGN KEY ("dataType")  REFERENCES "dataType" ("id"),
-- 	CONSTRAINT property_entity_name_unique UNIQUE("name", "entity"),
-- 	CONSTRAINT property_entity_systemName_unique UNIQUE("systemName", "entity")
-- );

-- create table "group"
-- (
-- 	"id" varchar(36) primary key,
-- 	"name" varchar(100) not null
-- );

-- create table "userGroup"
-- (
-- 	"id" varchar(36) primary key,
-- 	"group" varchar(36) not null,
-- 	"user" varchar(36) not null,
-- 	FOREIGN KEY ("user")  REFERENCES "user" ("id"),
-- 	FOREIGN KEY ("group")  REFERENCES "group" ("id"),
-- 	CONSTRAINT userGroup_group_user_unique UNIQUE("group", "user")
-- );

-- create table "permit"
-- (
-- 	"id" varchar(36) primary key,
-- 	"group" varchar(36) not null,
-- 	"access" boolean,
-- 	"update" boolean,
-- 	"create" boolean,
-- 	"delete" boolean,
-- 	"entity" varchar(36) not null,
-- 	FOREIGN KEY ("group")  REFERENCES "group" ("id"),
-- 	FOREIGN KEY ("entity")  REFERENCES "entity" ("id"),
-- 	CONSTRAINT entity_group_unique UNIQUE("group", "entity")
-- );



-- Добавление данных

-- insert into "dataType" ("id", "code", "name") values
-- ('701fbcfd-0025-4eb8-94c0-08e79ffb9155', 'string', 'Строка'),
-- ('96ab401b-592a-42c3-81f2-55fc01abd81c', 'integer', 'Целое'),
-- ('d3280a28-baa7-4275-8133-f2ff3e81439c', 'real', 'Вещественное'),
-- ('9db72fd9-76d6-4add-9305-fb88ca6deef6', 'boolean', 'Логическое'),
-- ('b2139972-eced-4153-b31a-4bf5505387a5', 'date', 'Дата'),
-- ('9da254b1-0835-4e9d-ab81-2877f92daa9d', 'reference', 'Ссылка');

-- insert into "user" values(
-- 	'f3a6944d-5150-4597-8b0b-65d6c891a52d',
-- 	'test_user',
-- 	'test_user',
-- 	'test_user',
-- 	'test_user',
-- 	null
-- );

-- insert into "group" values(
-- 	'22435d70-52fa-4182-8754-25be3fd09782',
-- 	'test_group'
-- );

-- insert into "userGroup" values(
-- 	'795053fe-ef15-4a2a-83b7-dae889447a74',
-- 	'22435d70-52fa-4182-8754-25be3fd09782',
-- 	'f3a6944d-5150-4597-8b0b-65d6c891a52d'
-- );

-- insert into "permitType" values(
-- 	'41421da5-a0a1-4ab2-8e09-5a445439c07a',
-- 	'test_permitType',
-- 	'test_permitType'
-- );

insert into "entity" ("id", "name", "systemName") values(
	'5ccb4b78-034b-49ba-b973-e08d8027b2a2',
	'Тестовая сущность',
	'test_entity'
);

-- insert into "permit" values(
-- 	'fc2716e1-c274-440e-b13e-d79436ac294f',
-- 	'5ccb4b78-034b-49ba-b973-e08d8027b2a2',
-- 	'41421da5-a0a1-4ab2-8e09-5a445439c07a',
-- 	'22435d70-52fa-4182-8754-25be3fd09782'
-- );

-- insert into "property" values(
-- 	'b1e75e07-5749-4a00-8c7b-d52c3fa686f9',
-- 	'test_property',
-- 	'test_property',
-- 	'5ccb4b78-034b-49ba-b973-e08d8027b2a2',
-- 	'701fbcfd-0025-4eb8-94c0-08e79ffb9155',
-- 	'7452772a-d0b7-4eb3-971c-581f4279c6cd',
-- 	null,
-- 	null,
-- 	null
-- );

-- insert into "object" values(
-- 	'4454f91b-8f0c-4ef3-9d0b-46ecbab146ad',
-- 	'test_object',
-- 	'5ccb4b78-034b-49ba-b973-e08d8027b2a2',
-- 	null
-- );

-- 11.02.2023
-- alter table "property"
-- add "refEntity" varchar(36);
-- alter table "property" 
-- add constraint fk_property_refEntity FOREIGN KEY ("refEntity") REFERENCES "entity"("id");