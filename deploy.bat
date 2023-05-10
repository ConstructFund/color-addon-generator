call npm run build
powershell -Command "Copy-Item ./dist/index.html -Destination ./dist/200.html"
surge ./dist --domain https://construct-addon-generator.surge.sh/