FROM python:3.12-alpine

    RUN adduser user --disabled-password
    RUN mkdir ~/.cache
    RUN pip install -U --no-cache-dir pip
    RUN apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev



    ENV PYTHONDONTWRITEBYTECODE=1
    ENV PYTHONUNBUFFERED=1

    COPY requirements-dev.txt .
    RUN --mount=type=cache,id=pip_main_dev,target=/root/.cache/pip pip install -r requirements-dev.txt

    COPY requirements.txt .
    RUN --mount=type=cache,id=pip_main,target=/root/.cache/pip pip install -r requirements.txt

    WORKDIR /app
    COPY backend .
    COPY scripts .

    RUN chown user /app
    USER user

    ENTRYPOINT 'scripts/entrypoint.sh'
