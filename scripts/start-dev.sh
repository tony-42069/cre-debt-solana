#!/usr/bin/env bash

docker-compose up -d
solana-test-validator --reset &
(
  cd programs/loan-core && anchor build
)
(
  cd api && yarn install && yarn start
) &
(
  cd app && yarn install && yarn start
) &
