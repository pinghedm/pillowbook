## Once
- Install Task [https://taskfile.dev/installation/] to make use of the Taskfile in the repo

- ```
  task shell
  [once inside]
  python manage.py migrate [if you haven't already run the migrations by another means]
  python manage.py createsuperuser
  [fill out the prompts to create your own user]
  ```
- run `npm i` from inside the frontend/ dir (this is basically a hack due to the way the volume mount works currently - should come up with a better solution!)

## Every time
Use `task backend` and `task frontend` to run the respective sides of the app.  

## Other Info
- `task shell` and `task shell_plus` are available if you need a shell into the backend container (eg to make migrations) or into a django shell
- to add new FE components, use `npx generate-react-cli component [component name] --path src/[pages or components]/[path to place you want it, no trailing slash]`
  - Command needs to be run from within the src/ dir in FE


## For Production Use
There are a parallel set of docker compose files and a task file for production use (they have .production in their file names).  The production system will set up
- a database with its own prod volume
- a container running gunicorn on (internal only) port 8000, with its own prod media files volume
- a container running caddy, serving the prod build of the frontend and also reverse proxying to the gunicorn instance.  This exposes port 8100 to the host system by default

You will need to create an .env.prod file that has at least
```
SECRET_KEY=[a real django secret key]
WEB_HOST=the hostname of where the backend will be running (so django can set allowed hosts and stuff)
```
You may also want to create a .caddy.env file for passing config through to caddy.  Right now the host/port isn't configurable (see prod.caddy) and it only takes the value of EMAIL from the env file, but that could be opened up more

The prod taskfile has several tasks, the main ones being `gunicorn` and `caddy`, which will build and then run the backend and frontend in daemon mode.  There's also `shell` and `down` helpers.  (You can run an alternate task file with -t, eg `task -t Taskfile.production.yml caddy`).  You may also want to set the DOCKER_HOST env var when running that command, to deploy to a remote host that you have configured (eg `DOCKER_HOST=ssh://user@remote_host task -t Taskfile.production.yml caddy` will start a daemon running the frontend at remote_host)

On the remote host you could just access pillowbook on port 8100, or you may want to put another reverse proxy in front of it to serve external trafffic.  
You will need to make the directory `/var/log/pillowbook` and `caddy.log`, `guni_access.log`, and `guni_error.log` in that directory, and make sure they are available for writing by the docker user on whatever host is running the containers
