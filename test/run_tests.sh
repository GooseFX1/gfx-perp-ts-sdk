#!/bin/bash

rm -rf node_modules
rm -rf package-lock.json
cd ..
npm run build
cd test
npm i
npm run test