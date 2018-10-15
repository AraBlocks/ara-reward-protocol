FROM node:latest
MAINTAINER "Huy Dao <huy@littlstar.com>"

# Create app directory
COPY . /root
WORKDIR /root
RUN mkdir /root/local

## ssh key
RUN chmod 0600 /root/.ssh/id_rsa
RUN eval $(ssh-agent -s) && ssh-add /root/.ssh/id_rsa
RUN ssh-keyscan github.com >> /root/.ssh/known_hosts
RUN echo "IdentityFile /root/.ssh/id_rsa" >> /etc/ssh/ssh_config

# Install app dependencies
RUN npm install
