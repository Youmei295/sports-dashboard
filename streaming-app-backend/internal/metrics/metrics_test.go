package metrics

import (
	"strings"
	"testing"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/testutil"
)

func TestRecordHTTPRequest(t *testing.T) {
	// Reset the metric for clean testing
	HTTPRequestsTotal.Reset()
	HTTPRequestDuration.Reset()

	// Record a few requests
	RecordHTTPRequest("GET", "/api/score", 200, 0.01)
	RecordHTTPRequest("GET", "/api/score", 200, 0.02)
	RecordHTTPRequest("POST", "/api/reset", 500, 0.05)

	// Verify counter has expected count
	metricCount := testutil.CollectAndCount(HTTPRequestsTotal)
	if metricCount == 0 {
		t.Error("Expected metrics to be collected")
	}
}

func TestRecordProxyRequest(t *testing.T) {
	// Reset the metric for clean testing
	ProxyRequestsTotal.Reset()
	ProxyRequestDuration.Reset()

	// Record proxy requests
	RecordProxyRequest("basketball", "score", 200, 0.05)
	RecordProxyRequest("soccer", "score", 200, 0.03)
	RecordProxyRequest("basketball", "reset", 500, 0.10)

	// Verify counter has expected count
	metricCount := testutil.CollectAndCount(ProxyRequestsTotal)
	if metricCount == 0 {
		t.Error("Expected metrics to be collected")
	}
}

func TestMetricsEndpointOutput(t *testing.T) {
	// Reset metrics
	HTTPRequestsTotal.Reset()
	HTTPRequestDuration.Reset()
	ProxyRequestsTotal.Reset()
	ProxyRequestDuration.Reset()

	// Record some metrics
	RecordHTTPRequest("GET", "/api/score", 200, 0.1)
	RecordProxyRequest("basketball", "score", 200, 0.05)

	// Gather metrics from the default registry
	metricFamilies, err := prometheus.DefaultGatherer.Gather()
	if err != nil {
		t.Fatalf("Failed to gather metrics: %v", err)
	}

	// Verify we have our custom metrics
	foundHTTPRequests := false
	foundProxyRequests := false

	for _, mf := range metricFamilies {
		if strings.HasPrefix(mf.GetName(), "backend_http_requests_total") {
			foundHTTPRequests = true
		}
		if strings.HasPrefix(mf.GetName(), "backend_proxy_requests_total") {
			foundProxyRequests = true
		}
	}

	if !foundHTTPRequests {
		t.Error("backend_http_requests_total metric not found")
	}
	if !foundProxyRequests {
		t.Error("backend_proxy_requests_total metric not found")
	}
}
