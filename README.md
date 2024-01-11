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
