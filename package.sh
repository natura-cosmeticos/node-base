#!/usr/bin/env bash
set -ex

version=$(git describe --tags --abbrev=0 || git log --pretty=oneline | head -1 | head -c 7)
package_name=architecture-node-base

rm -rf package build
mkdir package build
cp -rpv src index.js package.json package
tar -czvf build/${package_name}-${version}.tar.gz package
cp build/${package_name}-${version}.tar.gz build/${package_name}-latest.tar.gz
