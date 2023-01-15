# syntax=docker/dockerfile:1
FROM python:3-alpine
ENV PYTHONUNBUFFERED=1
WORKDIR /usr/src/app
COPY requirements.txt /usr/src/app/
RUN pip install -r requirements.txt
COPY ./web /usr/src/app/
COPY ./entrypoint.sh /

RUN apk update
RUN apk add chromium
RUN apk add chromium-chromedriver

ENTRYPOINT ["/entrypoint.sh"]
