# Matchmaker

This is the Matchmaker microservice for tabletoptournament.tools. It pairs players in event rounds according to the rules of the game they're playing.

Written for integration with the rest of the T4 software stack.

## Build and publish the wheel

_Packaging and build references here: https://packaging.python.org/en/latest/tutorials/packaging-projects/_

- Ensure `pyproject.toml` is up to date. Reference here: https://pip.pypa.io/en/stable/reference/build-system/pyproject-toml/
- Ensure you have python3.7+, pip and venv (`apt-get install python3-pip python3-venv`), and build (`pip3 install --upgrade build`) installed.
- Build the wheel
  `python3 -m build`
- Publish the wheel (requires rights on PyPI--update pyproject.toml to your own repo, or contact a T4 collaborator for T4 access)
  `python3 -m twine upload dist/*`

## Build and publish the server Docker image

- Ensure `build.dockerfile` is updated.
- From ./docker_setup/, build the Docker image.
  `docker build -t sprintska/matchmaker:vX.Y.Z -f ./build.dockerfile .`
- Push the Docker image to Docker Hub (update target repo as appropriate or request access).
  `docker push sprintska/matchmaker:vX.Y.Z`

## Deploy

- Set the following env vars in your T4 .env file:
  `MATCHMAKER_DEBUG=[(0),1]`
  `MATCHMAKER_INSECURE_USE_HTTP=[(0),1]`
  `MATCHMAKER_HASURA_URL=url.to.hasura`
  `MATCHMAKER_DOMAIN=url.to.this.service`
  `MATCHMAKER_HASURA_ADMIN_SECRET=hasura_secret`

- Deploy with docker compose (see top level Readme).
