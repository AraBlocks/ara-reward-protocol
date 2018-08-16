echo "Starting ARA Test Environment"
conemu="/c/Program\ Files/ConEmuPack.180528/ConEmu.exe"
ganache="/c/Program\ Files/Ganache/Ganache.exe"
archiver="/d/Development/EnvironmentA/ara-network-node-identity-archiver"
resolver="/d/Development/EnvironmentA/ara-network-node-identity-resolver"
afs="/d/Development/EnvironmentA/ara-filesystem"
afsconsttemplate="/d/Development/EnvironmentA/farming-protocol/scripts/afs-constants-template.js"
afpconsttemplate="/d/Development/EnvironmentA/farming-protocol/scripts/afp-constants-template.js"
trufftemplate="/d/Development/EnvironmentA/farming-protocol/scripts/truffle-template.js"
entrydir="/d/Development/EnvironmentA/farming-protocol"
exampledir=$entrydir/examples
examplecontractdir=$exampledir/farming_contract
password="supersecurepassword"
afs1content="/d/Littlstar/ContentSmall"
afs2content="/d/Littlstar/ContentBig"
afs3content="/d/Littlstar/ContentComplex"


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

echo "Cloning truffle config..."
host="192.168.128.250"
port="8545"

sed "s/HostPlaceholder/$host/" $trufftemplate | sed "s/PortPlaceholder/$port/" > $afs/truffle.js
sed "s/HostPlaceholder/$host/" $trufftemplate | sed "s/PortPlaceholder/$port/" > $examplecontractdir/truffle.js

echo "Migrating AFS Contracts..."
cd $afs
rm -rf build/
truffle migrate

priceaddress="$(truffle networks | grep "Price:" | sed 's/^.*: //')"
storageaddress="$(truffle networks | grep "Storage:" | sed 's/^.*: //')"

sed "s/StoragePlaceholder/$storageaddress/" $afsconsttemplate | sed "s/PricePlaceholder/$priceaddress/" > $afs/constants.js

echo "Migrating Example AFP Contracts..."
cd $examplecontractdir
rm -rf build/
truffle migrate
farmingaddress="$(truffle networks | grep "Farming:" | sed 's/^.*: //')"

echo "Creating an AID..."
id="$(aid create <<< $password | grep "did:ara:" | head -1 | sed 's/^.*did:ara://')"

echo "Creating AFSes..."
afs1="$(afs create $id <<< $password | grep "did:ara:" | head -1 | sed 's/^.*did:ara://')"
afs add $afs1 $afs1content <<< $password
afs commit $afs1 -f <<< $password
afs2="$(afs create $id <<< $password | grep "did:ara:" | head -1 | sed 's/^.*did:ara://')"
afs add $afs2 $afs2content <<< $password
afs commit $afs2 -f <<< $password
afs3="$(afs create $id <<< $password | grep "did:ara:" | head -1 | sed 's/^.*did:ara://')"
afs add $afs3 $afs3content <<< $password
afs commit $afs3 -f <<< $password

sed "s/FarmingPlaceholder/$farmingaddress/" $afpconsttemplate | sed "s/AFS1Placeholder/$afs1/" | sed "s/AFS2Placeholder/$afs2/" | sed "s/AFS3Placeholder/$afs3/" > $exampledir/constants.js


echo "ARA Test Environment Ready"
read -p "Press Enter to Close."