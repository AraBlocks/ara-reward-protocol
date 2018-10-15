in farming folder, run:
-	docker build . -t ara/ara-farming

in truffle folder, run:
-	docker build . -t ara/truffle-migration

in the local folder/farming-contract (that has truffle codes), run:
- 	docker-compose up -d

in the local folder, run:
-	docker run -v "$(pwd)":/root/local -it hdao/ara-farming -n ara-farmer /bin/bash
