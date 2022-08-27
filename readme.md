To spin up your local dev instance of T4:

1. Install Node.js, NPM, and Docker

2. Install Hasura dependencies in ./T4/:

   - `npm install`

3. Install application dependencies in ./T4/www/:

   - `npm install`

4. Start the Hasura GraphQL engine Docker:

   - `docker-compose up -d`

5. Either create a Postgres DB or message Ardaedhel for access to his Heroku dev DB.

   - If you're creating a new DB from scratch, use the SQL in ./T4/www/migrations/default/1660374352905_init/up.sql to create the requisite tables.

6. Connect Hasura to the DB that you're using:

   - Navigate to Hasura at http://localhost:8080/
   - Data tab > "Manage" in the left pane, and follow prompts to finish setup.

7. Start the dev server from ./T4/www/:
   - `npm start`

At this point the page should render in whatever browser you have open, at http://localhost:3000/. There will be no seed data in your DB if you created one from scratch, so you'll need to go into Hasura (http://localhost:8080/) to manually input some. I found the interface pretty intuitive, so exerciseforthereader.png. Once you've created a Tournament entry (which requires a few rows in other tables too), the details will show up on the page.
