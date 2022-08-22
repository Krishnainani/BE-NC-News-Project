# Good Morning News App


## Link to API 

https://good-morning-news-app.herokuapp.com/

## Summary

Good Morning News app is a database of articles which consist of different api's to get the articles. You can also sort the articles by date, order and topic name. If all topics are requested, you can get the article slug and small description. Users data can also be fetch by the api and comments on a article can also be fetched.

## Setup

Fork the repositary and then you can clone it on your local computer by coping the https link ending with the .git.

### Install the project's dependencies:

```sh
npm install
```

### Setup the database

```sh
npm run setup-dbs
```

### Create .env files

```sh
To access the databases you have to create two .env files one as `.env.development` and the other as `.env.test` and then you have to populate it with `database=Your-Database-Here` in our case `PGDATABASE=nc_news_test` for test and `PGDATABASE=nc_news` for development.
```

### Ensure the tests run:

```sh
npm test
```

## Node and Postgres requirements

The node version used while building this api is

```sh
v16.16.0
```
The postgres version used while building this api is

```sh
psql (PostgreSQL) 10.21 (Ubuntu 10.21-0ubuntu0.18.04.1)
```


