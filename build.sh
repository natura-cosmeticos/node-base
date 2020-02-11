#!/usr/bin/env bash
set -ex

rm -rf dist
mkdir dist
cp -rpv src index.js dist
