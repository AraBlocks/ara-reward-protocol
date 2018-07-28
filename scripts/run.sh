echo "Starting ARA Test Environment"
conemu="/c/Program\ Files/ConEmuPack.180528/ConEmu.exe"
ganache="/c/Program\ Files/Ganache/Ganache.exe"
archiver="/d/Development/EnvironmentA/ara-network-node-identity-archiver"
resolver="/d/Development/EnvironmentA/ara-network-node-identity-resolver"
afs="/d/Development/EnvironmentA/ara-filesystem"
consttemplate="/d/Development/EnvironmentA/farming-protocol/scripts/constants-template.js"
entrydir="/d/Development/EnvironmentA/farming-protocol"

echo "Opening Farming Directory..."
eval "$conemu -reuse -dir $entrydir -run bash -new_console:t:\"Entry\"" &

echo "Starting Ganache..."
eval "$conemu -reuse -run $ganache" &

echo "Starting Archiver..."
eval "$conemu -reuse -dir $archiver -run \"ann -t . -k archiver\" -new_console:t:\"Archiver\"" &

echo "Starting Resolver..."
eval "$conemu -reuse -dir $resolver -run \"ann -t . -k resolver\" -new_console:t:\"Resolver\"" &

echo "Waiting for ganache..."
while [ "$(netstat -na | grep 8545 | grep -c ESTABLISHED)" = 0 ]
do sleep 2
done

echo "Migrating Contracts..."
cd $afs
rm -rf build/
truffle migrate

priceaddress="$(truffle networks | grep "Price:" | sed 's/^.*: //')"
storageaddress="$(truffle networks | grep "Storage:" | sed 's/^.*: //')"

sed "s/StoragePlaceholder/$storageaddress/" $consttemplate | sed "s/PricePlaceholder/$priceaddress/" > $afs/constants.js


echo "ARA Test Environment Ready"
read -p "Press Enter to Close."