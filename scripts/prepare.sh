#!/usr/bin/env bash

curl -L https://github.com/jqlang/jq/releases/latest/download/jq-linux-amd64 -o jq
chmod a+x jq

BIOME_VERSION=$(npm -j ls | ./jq -r '.dependencies["@biomejs/biome"].version')
npm i -DE biome-cli-codesandbox@$BIOME_VERSION

npm pkg set scripts.lint="BIOME_BINARY=biome-cli-codesandbox/biome $(npm pkg get scripts.lint | ./jq -r)"
npm pkg set scripts['format:biome']="BIOME_BINARY=biome-cli-codesandbox/biome $(npm pkg get scripts['format:biome'] | ./jq -r)"
npm pkg set scripts['check:biome']="BIOME_BINARY=biome-cli-codesandbox/biome $(npm pkg get scripts['check:biome'] | ./jq -r)"

rm jq