FROM python:3.10

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update -y
RUN apt-get install -y nginx systemctl

COPY ./matchmaker.service /etc/systemd/system/matchmaker.service
RUN mkdir -p /var/www/matchmaker/html

WORKDIR /usr/src/matchmaker

COPY ./matchmaker /etc/nginx/sites-available
RUN ln -s /etc/nginx/sites-available/matchmaker /etc/nginx/sites-enabled/
RUN rm /etc/nginx/sites-enabled/default

# COPY ./nginx_conf_fix.sh ./
# RUN chmod +x ./nginx_conf_fix.sh
# RUN ./nginx_conf_fix.sh
# RUN rm ./nginx_conf_fix.sh

RUN pip install --upgrade pip
# RUN pip install matchmaker-t4-arm
RUN pip install matchmaker-t4

RUN chown www-data:www-data /usr/local/lib/python3.*/site-packages/matchmaker

RUN systemctl enable matchmaker
RUN systemctl enable nginx

# ENV MATCHMAKER_TESTING 1
ENV PYTHONUNBUFFERED 1
ENV MATCHMAKER_DEBUG 0
ENV MATCHMAKER_INSECURE_USE_HTTP 0

ENV MATCHMAKER_HASURA_URL url.to.hasura
ENV MATCHMAKER_DOMAIN url.to.this.service

ENV MATCHMAKER_HASURA_ADMIN_SECRET password

CMD ["systemctl", "start", "matchmaker", "nginx"]