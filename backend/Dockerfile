FROM python:3.12-alpine as BASE
    ENV PYTHONDONTWRITEBYTECODE=1
    ENV PYTHONUNBUFFERED=1

    RUN adduser user --disabled-password
    RUN mkdir ~/.cache
    RUN pip install -U --no-cache-dir pip
    RUN apk add --no-cache --virtual .build-deps gcc musl-dev 
    RUN apk add --no-cache --virtual .run-deps postgresql-dev

    WORKDIR /app

    COPY requirements-dev.txt .
    RUN --mount=type=cache,id=pip_main_dev,target=/root/.cache/pip pip install --no-cache-dir -r requirements-dev.txt

    COPY requirements.txt .
    RUN --mount=type=cache,id=pip_main,target=/root/.cache/pip pip install --no-cache-dir -r requirements.txt

    RUN apk --purge del .build-deps

    RUN chown user /app

    COPY backend .
    COPY scripts scripts/

    RUN mkdir /app/media
    RUN chown user /app/media


    USER user

FROM base as dev
    ENTRYPOINT 'scripts/entrypoint.sh'

FROM base as prod
    COPY manage.py .
    COPY app app
    COPY backend backend
    RUN mkdir /app/staticfiles
    RUN chown user /app/staticfiles
    ENTRYPOINT 'scripts/entrypoint.sh'
