const packageJson = require('./package.json')
const got = require('got')
const express = require('express')
const app = express()

const config = {
    server: {
        host: process.env.SERVER_HOST || '0.0.0.0',
        port: process.env.SERVER_PORT || 8080
    },
    jsonrpc: {
        host: process.env.JSONRPC_HOST || '127.0.0.1',
        port: process.env.JSONRPC_PORT || 8545
    },
    meta: {
        measurement: process.env.MEASUREMENT || 'blockchain-node',
        tags: { // This is all just cleanup of a simple key value list
            ...(process.env.ADDITIONAL_TAGS || '')
                .split(',')
                .filter(v => v.indexOf('=') !== -1)
                .map(v => v
                    .split('=')
                    .map(v => (v || '').trim())
                    .filter(v => !!v)
                    .map(v => v.replace(/[^a-z0-9]/g, '-').replace(/-+/, '-'))
                )
                .filter(v => v.length === 2)
                .reduce((o, i) => (o[i[0]] = i[1], o), {}),
            ...[ // Add the fixed metadata second, so it will overwrite additional tags
                process.env.TAG_TECHNOLOGY ? ['technology', process.env.TAG_TECHNOLOGY] : undefined,
                process.env.TAG_BLOCKCHAIN ? ['blockchain', process.env.TAG_BLOCKCHAIN] : undefined,
                process.env.TAG_NETWORK ? ['network', process.env.TAG_NETWORK] : undefined,
                process.env.TAG_HOST ? ['host', process.env.TAG_HOST] : undefined
            ]
                .filter(v => !!v)
                .map(v => v.map(v => v.trim()).map(v => v.replace(/[^a-z0-9]/g, '-').replace(/-+/, '-')))
                .reduce((o, i) => (o[i[0]] = i[1], o), {})
        }
    }
}

// Pre-render the tags string
config.meta.tagString = Object.keys(config.meta.tags).map(v => `${v}=${config.meta.tags[v]}`).join(',')

// Return package name an version
app.get('/', (req, res) => res.json({name: packageJson.name, version: packageJson.version}))

// Ping endpoint that just returns OK
app.get('/ping', (req, res) => res.sendStatus(200))

// Render InfluxDB formatted metrics
app.get('/influxdb', async (req, res) => {
    try {
    // Fetch peer count and block height via RPC
        const result = await Promise.all([
            got.post(`http://${config.jsonrpc.host}:${config.jsonrpc.port}`, {
                json: { jsonrpc: '2.0', method: 'net_peerCount', id: Date.now() }
            }).json(),
            got.post(`http://${config.jsonrpc.host}:${config.jsonrpc.port}`, {
                json: { jsonrpc: '2.0', method: 'eth_blockNumber', id: Date.now() }
            }).json()
        ])

        if (!result[0] || !result[0].result) {
            throw new Error('Missing peer count: ' + JSON.stringify(result[0]))
        }

        if (!result[1] || !result[1].result) {
            throw new Error('Missing block height: ' + JSON.stringify(result[1]))
        }

        // Compose output string. See https://docs.influxdata.com/influxdb/v1.7/write_protocols/line_protocol_tutorial/#syntax
        const output = [
            config.meta.measurement,
            config.meta.tagString ? `,${config.meta.tagString}` : '',
            ' ',
            `peer-count=${parseInt(result[0].result, 16)}`,
            ',',
            `block-height=${parseInt(result[1].result, 16)}`,
            ' ',
            Date.now() * 1000000 // Fake nanoseconds. This resolution is not needed for our usecase.
        ].join('')

        res.send(output)
    }
    catch (err) {
        console.error((err && err.response && err.response.body) || err)
        res.sendStatus(500)
    }
})

app.listen(config.server.port, config.server.host, () => {
    console.log(`Server listening on ${config.server.host}:${config.server.port}`)
})
