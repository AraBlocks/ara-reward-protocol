# Node image
FROM node:rpc
# Maintainer
MAINTAINER Huy Dao <hdao@littlstar.com>
# Install the packages
RUN npm install -g --save ethereumjs-testrpc
# Expose port
EXPOSE 8545
# Start TestRPC
ENTRYPOINT ["testrpc"]
