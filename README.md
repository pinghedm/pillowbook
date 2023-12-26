## Once
- Install Task [https://taskfile.dev/installation/] to make use of the Taskfile in the repo
- ```
  task shell
  [once inside]
  python manage.py migrate [if you haven't already run the migrations by another means]
  python manage.py createsuperuser
  [fill out the prompts to create your own user]
  ```

## Every time
Use `task backend` and `task frontend` to run the respective sides of the app.  

## Other Info
`task shell` and `task shell_plus` are available if you need a shell into the backend container (eg to make migrations) or into a django shell
