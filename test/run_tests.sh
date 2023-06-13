#!/bin/bash

rm -rf node_modules
rm -rf package-lock.json
cd ..
rm -rf node_modules
rm -rf package-lock.json
npm i
npm run build
cd test
npm i
npm run test