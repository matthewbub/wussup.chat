-- migration number: 0005   2024-12-29T04:19:54.600Z
create table if not exists apps (
    id text primary key,
    name text not null,
    description text,
    domain text,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

-- add app_id to users table
alter table users add column app_id text references apps(id);

create index idx_users_app_id on users(app_id);
