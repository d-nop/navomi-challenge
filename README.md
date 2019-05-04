# Navomi-Challenge

This app will check if there's movie data in the database, if not, OMBD's api will be called and load the database with movie information.  A user can create, read, update and delete movie data.

## Installation

- install [MongoDB](https://docs.mongodb.com/manual/installation/)
- Clone the repository to your local file system (https://github.com/d-nop/navomi-challenge.git)
- Get api key from [OBDB] (http://www.omdbapi.com/apikey.aspx)

In your terminal and or text editor:
```
cd navomi-challenge
touch .env
- open .env file in text editor and add API_KEY=<"YOUR API KEY">
npm install
mongod
node app.js
```
go to localhost 3000

## Contributing
Pull requests are welcome.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
