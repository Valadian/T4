To spin up your local dev instance of T4:

1. Install Node.js, NPM, and Docker

2. Install Hasura dependencies in ./T4/:

   - `npm install`

3. Install application dependencies in ./T4/www/:

   - `npm install`

4. Start the Hasura GraphQL engine Docker:

   - `docker-compose up -d`

5. Install Hasura CLI

   - `npm install --global hasura-cli`

   Full instructions are here: https://hasura.io/docs/latest/hasura-cli/install-hasura-cli/

6. Apply Initial Migation

   - `cd www/hasura-data`
   - `hasura deploy --endpoint http://localhost:8080`

7. Apply Seed

   - `cd www/hasura-data`
   - `hasura seed apply --file 1661564742301_GameSeed.sql`
   - `hasura seed apply --file 1661564794900_UserSeed.sql`
   - `hasura seed apply --file 1661564773764_TournamentSeed.sql`

7. Start the dev server from ./T4/www/:
   - `npm start`

At this point the page should render in whatever browser you have open, at http://localhost:3000/. There will be no seed data in your DB if you created one from scratch, so you'll need to go into Hasura (http://localhost:8080/) to manually input some. I found the interface pretty intuitive, so exerciseforthereader.png. Once you've created a Tournament entry (which requires a few rows in other tables too), the details will show up on the page.
