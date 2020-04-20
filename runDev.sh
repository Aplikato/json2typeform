cp ./styles/aplikato.css ./dist/style.css
./node_modules/http-server/bin/http-server -p 8080 &
tsc -w --p ./tsconfig.test.json
