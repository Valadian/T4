# Developer Environment Setup

## On your local host

1. Install Node.js, NPM, and Docker

## In ./T4/

2. Install Hasura GraphQL Engine dependencies:

   - `npm install`

3. Install Hasura CLI

   - `npm install --global hasura-cli`

   Full instructions are here: https://hasura.io/docs/latest/hasura-cli/install-hasura-cli/

4. Start the Hasura GraphQL engine Docker:

   - `docker-compose up -d`

# In ./T4/hasura-data/

5. Apply Initial Migation

   - `hasura deploy --endpoint http://localhost:8080`

## In ./T4/dev_utils/

6. Apply Seed data to database:
   - `./plant_seeds.sh` or `./plant_seeds.ps1`, as applicable

## In ./T4/www/

7. Install application dependencies:

   - `npm install`



8. Start the dev server:
   - `npm start`

At this point the page should render in whatever browser you have open, at http://localhost:3000/. 

To access the Hasura GraphQL engine console, from a terminal at ./T4/www/hasura-data:
   - `hasura console`
   This will open a Hasura console in a browser tab.  From here you can interact graphically with the GraphQL engine and the data.

# Auth0 configuration

THE BELOW SECTION IS IN WORK AND INCOMPLETE

Follow setup instructions here: https://hasura.io/docs/latest/guides/integrations/auth0-jwt/#create-an-auth0-application

Setup ngrok for local development

run: 
   - `ngrok http 3000`
   
Set application logo: https://i.imgur.com/wpr0uCy.png
Application URIs > Application Login URI: INSERT_NGROK_URL_HERE
Application URIs > Allowed callback URLs: http://jwt.io
Advanced Settings > OAuth > OIDC Conformant: disabled
