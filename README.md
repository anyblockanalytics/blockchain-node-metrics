Blockchain Node Metrics
=======================
Lightweight server that fetches metrics from an Ethereum blockchain node and returns the result in InfluxDB line protocol syntax.
Simplifies monitoring in a dockerized environment.

Configuration
-------------
See `.env.example` for all available configuration options.

Development
-----------
`npm run dev`

Docker
------
```
docker run --rm -p 8080:8080 -e "JSONRPC_HOST=172.17.0.1" anyblockanalytics/blockchain-node-metrics:latest
```

Possible Improvements
---------------------
- Unix Socket Support
- WebSocket Support
- Prometheus Support
- Nagios Support
