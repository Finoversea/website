# FinOversea Deployment Guide

This directory contains Kubernetes deployment manifests for the FinOversea backend service.

## Directory Structure

```
deploy/k8s/
├── namespace.yaml      # Namespace, ServiceAccount, RBAC
├── configmap.yaml      # Application configuration
├── secret.yaml.template # Secrets template (DO NOT commit with real values)
├── deployment.yaml     # Backend deployment
├── service.yaml        # ClusterIP services
├── ingress.yaml        # Ingress configurations
└── redis.yaml          # Redis standalone deployment
```

## Prerequisites

1. Kubernetes cluster (v1.24+)
2. NGINX Ingress Controller installed
3. cert-manager (optional, for TLS)

## Quick Start

### 1. Create Namespace and RBAC

```bash
kubectl apply -f namespace.yaml
```

### 2. Create Secrets

DO NOT commit secrets with real values. Create from template:

```bash
kubectl create secret generic finoversea-secrets \
  --from-literal=DATABASE_URL='postgresql+asyncpg://finoversea:YOUR_PASSWORD@postgres-host:5432/finoversea' \
  --from-literal=OPENAI_API_KEY='YOUR_API_KEY' \
  -n finoversea
```

Or use sealed-secrets/external-secrets for production.

### 3. Apply Configuration

```bash
kubectl apply -f configmap.yaml
kubectl apply -f redis.yaml
```

### 4. Deploy Backend

Update the image tag in `deployment.yaml` to your actual image:

```yaml
image: your-registry/finoversea/backend:v1.0.0
```

Then apply:

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

### 5. Configure Ingress

Update the hostnames in `ingress.yaml` to match your domain:

```yaml
host: api.your-domain.com
```

Apply ingress:

```bash
kubectl apply -f ingress.yaml
```

## Verify Deployment

```bash
# Check pod status
kubectl get pods -n finoversea

# Check services
kubectl get svc -n finoversea

# Check ingress
kubectl get ingress -n finoversea

# Test health endpoint
kubectl port-forward svc/finoversea-backend 8000:80 -n finoversea
curl http://localhost:8000/api/v1/health
```

## Configuration Reference

### ConfigMap Values

| Key | Description | Default |
|-----|-------------|---------|
| APP_NAME | Application name | FinOversea |
| APP_VERSION | Version | 1.0.0 |
| DEBUG | Debug mode | false |
| REDIS_URL | Redis connection | redis://redis-service:6379/0 |
| OPENAI_BASE_URL | OpenAI API URL | https://api.openai.com/v1 |
| LLM_MODEL | LLM model | gpt-4o-mini |
| COLLECTOR_TIMEOUT | Collector timeout (s) | 30 |
| COLLECTOR_MAX_CONCURRENT | Max concurrent collectors | 10 |
| PUSH_BATCH_SIZE | Push batch size | 100 |
| TAG_CONFIDENCE_THRESHOLD | Tag confidence threshold | 0.7 |

### Secret Values (Required)

| Key | Description |
|-----|-------------|
| DATABASE_URL | PostgreSQL connection string with credentials |
| OPENAI_API_KEY | OpenAI API key |

## Production Recommendations

1. Use external PostgreSQL (Cloud SQL, RDS, etc.)
2. Use external Redis cluster for HA
3. Use sealed-secrets or external-secrets for secret management
4. Configure resource limits based on your workload
5. Enable HPA for autoscaling
6. Use PodDisruptionBudget for HA
7. Configure network policies for security