package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

// HTTP metrics for the backend service
var (
	// HTTPRequestsTotal tracks the total number of HTTP requests
	HTTPRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "backend_http_requests_total",
			Help: "Total number of HTTP requests by method, path, and status",
		},
		[]string{"method", "path", "status"},
	)

	// HTTPRequestDuration tracks request latency in seconds
	HTTPRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "backend_http_request_duration_seconds",
			Help:    "HTTP request latency in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path"},
	)

	// ProxyRequestsTotal tracks upstream proxy calls
	ProxyRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "backend_proxy_requests_total",
			Help: "Total number of upstream proxy requests by sport and action",
		},
		[]string{"sport", "action", "status"},
	)

	// ProxyRequestDuration tracks proxy request latency
	ProxyRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "backend_proxy_request_duration_seconds",
			Help:    "Proxy request latency in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"sport", "action"},
	)
)

// RecordHTTPRequest records an HTTP request metric
func RecordHTTPRequest(method, path string, status int, durationSeconds float64) {
	statusStr := "2xx"
	switch {
	case status >= 500:
		statusStr = "5xx"
	case status >= 400:
		statusStr = "4xx"
	case status >= 300:
		statusStr = "3xx"
	}
	HTTPRequestsTotal.WithLabelValues(method, path, statusStr).Inc()
	HTTPRequestDuration.WithLabelValues(method, path).Observe(durationSeconds)
}

// RecordProxyRequest records a proxy request metric
func RecordProxyRequest(sport, action string, status int, durationSeconds float64) {
	statusStr := "success"
	if status >= 400 {
		statusStr = "error"
	}
	ProxyRequestsTotal.WithLabelValues(sport, action, statusStr).Inc()
	ProxyRequestDuration.WithLabelValues(sport, action).Observe(durationSeconds)
}
