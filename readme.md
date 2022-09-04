# Developer Environment Setup

## On your local host

1. Install Node.js, NPM, and Docker

## In ./T4/

2. Install Hasura GraphQL Engine dependencies:
   - `npm install`

3. Install Hasura CLI:
   - `npm install --global hasura-cli`
   Full instructions are here: https://hasura.io/docs/latest/hasura-cli/install-hasura-cli/

4. Start the Hasura GraphQL engine Docker and supporting PostGres server container:
   - `docker-compose up -d`

## In ./T4/dev_utils/

5. Apply Seed data to database:
   - `./plant_seeds.sh` or `./plant_seeds.ps1`, as applicable

## In ./T4/www/

6. Install application dependencies:

   - `npm install`

7. Start the dev server:
   - `npm start`

At this point the page should render in a browser tab at http://localhost:3000/. 

To access the Hasura GraphQL engine console, from a terminal at ./T4/www/hasura-data:
   - `hasura console`
   This will open a Hasura console in a browser tab.  From here you can interact graphically with the GraphQL engine and the data.