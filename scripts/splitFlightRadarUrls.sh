#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Usage: $0 <wildfireId>"
    exit 1
fi

someId="$1"
dataDir="./data/$someId"

mkdir -p "$dataDir"

awk -F'/' '{print $4}' "$dataDir/flightRadarFlightUrls.txt" | sort -u | grep -v '^$' > "$dataDir/aircraft.txt"
awk -F'/' '{print $NF}' "$dataDir/flightRadarFlightUrls.txt" | sort -u > "$dataDir/flightIds.txt"