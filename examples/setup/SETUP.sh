echo "Starting ARA Test Environment"
consttemplate="./constants-template.js"
afscontent="./example-content.mp4"
password="supersecurepassword"
networkname="farmingexample"
keyfile="keys"

echo "Migrating Example AFP Contract..."
cd ../utils/farming_contract
rm -rf build/
truffle migrate
farmingaddress="$(truffle networks | grep "Farming:" | sed 's/^.*: //')"
cd ../../setup/

echo "Creating Requester AID..."
requesterid="$(aid create <<< $password | grep "did:ara:" | head -1 | sed 's/^.*did:ara://')"

echo "Creating Farmer AID..."
farmerid="$(aid create <<< $password | grep "did:ara:" | head -1 | sed 's/^.*did:ara://')"

echo "Creating AFSes..."
afs1="$(afs create $farmerid <<< $password | grep "did:ara:" | head -1 | sed 's/^.*did:ara://')"
afs add $afs1 $afscontent <<< $password
afs commit $afs1 -f <<< $password

echo "Creating ANK for Requester..."
ank -i $requesterid -s $password -n $networkname -o ../utils/$keyfile <<< $password

echo "Updating constants.js..."
sed "s/ContractPlaceholder/$farmingaddress/" $consttemplate | sed "s/PasswordPlaceholder/$password/" \
 | sed "s/NetworkPlaceholder/$networkname/" | sed "s/KeyPlaceholder/$keyfile/" \
 | sed "s/AFS1Placeholder/$afs1/" | sed "s/FarmerPlaceholder/$farmerid/" \
 | sed "s/RequesterPlaceholder/$requesterid/" > ../constants.js