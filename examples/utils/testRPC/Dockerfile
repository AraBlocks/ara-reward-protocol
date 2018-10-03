# Node image
FROM node:latest
# Maintainer
MAINTAINER Huy Dao <huy@littlstar.com>
# Install the packages
RUN npm install -g --save ethereumjs-testrpc
# Expose port
EXPOSE 8545
# Start TestRPC
ENTRYPOINT ["testrpc"]
