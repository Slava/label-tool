#!/bin/bash
cd client
yarn install
env REACT_APP_DEMO=1 PUBLIC_URL="/label-tool/demo/" yarn build
cd ..
rm -rf demo
mv client/build ./demo
