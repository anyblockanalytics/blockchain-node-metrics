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

Endpoints
---------
### `/`
Basic application information `{"name":"blockchain-node-metrics","version":"0.1.0"}`

### `/ping`
Application health endpoint. Just returns HTTP Status 200

### `/influxdb`
Metrics in InfluxDB line protocol syntax. See https://docs.influxdata.com/influxdb/v1.7/write_protocols/line_protocol_tutorial/#syntax
`blockchain-node,technology=ethereum,blockchain=ethereum,network=kovan,host=localhost peer-count=19i,block-height=9009009i 1576700441997000000`

Telegraf
--------
A basic telegraf configuration could look like this
```
[[inputs.http]]
  urls = [
    "http://localhost:8080/influxdb/"
  ]
```

Possible Improvements
---------------------
- Unix Socket Support
- WebSocket Support
- Prometheus Support
- Nagios Support
