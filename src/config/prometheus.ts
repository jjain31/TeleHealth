import client from 'prom-client'

const register = new client.Registry()

register.setDefaultLabels({
    app: 'auth-user-service',
})

client.collectDefaultMetrics({ register })
const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5],
})

const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
})

register.registerMetric(httpRequestDuration)
register.registerMetric(httpRequestsTotal)
export { register, httpRequestDuration, httpRequestsTotal }
