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

6. Apply Seed data to database

   - `./plant_seeds.sh` or `./plant_seeds.ps1`, as applicable

7. Start the dev server from ./T4/www/:
   - `npm start`

At this point the page should render in whatever browser you have open, at http://localhost:3000/. 

To access the Hasura GraphQL engine console, from a terminal at ./T4/www/hasura-data:
   - `hasura console`
   This will spin up a console and open it in a tab in your browser.  From here you can interact with the GraphQL engine and the data.