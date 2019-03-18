#!/bin/bash
cd client
yarn install
env REACT_APP_DEMO=1 PUBLIC_URL="/labeltool/demo/" yarn build
cd ..
rm -rf demo
mv client/build ./demo
