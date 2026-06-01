# 🏟️ Distributed Systems & DevOps Monorepo 
**A Polyglot Architecture showcasing CI/CD, Containerization, and GitOps**

> [!IMPORTANT]
> **Note to Reviewers:** The "Real-Time Sports Dashboard" application contained within this repository is a functional but secondary artifact. Its true purpose is to serve as a complex, multi-service payload designed strictly to demonstrate production-grade DevOps skills, container orchestration, and strict testing pipelines.

## 🎯 Engineering Objective
This repository is engineered to showcase how to manage, test, and deploy a decoupled microservice architecture. By utilizing a mix of Python, Go, and TypeScript, this project creates intentional infrastructure friction to demonstrate advanced pipeline orchestration, including:
* Seamless Continuous Integration (CI) and strict PR gating.
* Local-to-Cloud environmental parity.
* Polyglot monorepo management with path-filtered testing.

---

## 🏗️ The Payload (The Application Architecture)
To adequately test the infrastructure, the underlying dummy application is decoupled into three distinct services, containerized and orchestrated via **Docker Compose**:
* **Simulation Ingestion (Python/FastAPI):** A lightweight generator broadcasting high-throughput mock match telemetry.
* **Core Streaming Engine (Go 1.22+):** A highly concurrent, thread-safe backend utilizing Goroutines to route telemetry.
* **Real-Time Client (Next.js/TypeScript):** A reactive frontend dashboard consuming WebSocket streams.