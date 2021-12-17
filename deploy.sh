#!/bin/bash

echo "Deploying to Gyan"
yarn build &&
scp -r build/* redunda@redundantrobot.com:/home/redunda/domains/redundantrobot.com/public_html/gyan_graph
