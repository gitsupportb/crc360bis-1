# BCP Securities Services - Reporting Dashboard
# Multi-stage Docker build for production-ready containerization
# 
# This Dockerfile creates an optimized container for the BCP Securities Services
# reporting dashboard with proper security, health checks, and volume management.

# ============================================================================
# Stage 1: Base Python Environment
# ============================================================================
FROM python:3.11-slim as base

# Set environment variables for Python
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ============================================================================
# Stage 2: Application Setup
# ============================================================================
FROM base as application

# Create application user for security
RUN groupadd -r bcpapp && useradd -r -g bcpapp bcpapp

# Set working directory
WORKDIR /app

# Create necessary directories with proper permissions
RUN mkdir -p /app/UPLOADED_REPORTINGS \
    /app/logs \
    /app/data \
    && chown -R bcpapp:bcpapp /app

# Copy application files
COPY --chown=bcpapp:bcpapp . /app/

# Ensure the serve.py script is executable
RUN chmod +x /app/serve.py

# Create a health check script
RUN echo '#!/bin/bash\ncurl -f http://localhost:8000/complete_dashboard.html || exit 1' > /app/healthcheck.sh \
    && chmod +x /app/healthcheck.sh \
    && chown bcpapp:bcpapp /app/healthcheck.sh

# ============================================================================
# Stage 3: Production Configuration
# ============================================================================
FROM application as production

# Switch to non-root user
USER bcpapp

# Expose the application port
EXPOSE 8000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /app/healthcheck.sh

# Set up volume mount points
VOLUME ["/app/UPLOADED_REPORTINGS", "/app/data", "/app/logs"]

# Default command to start the server
CMD ["python3", "/app/serve.py"]

# ============================================================================
# Build Information
# ============================================================================
LABEL maintainer="BCP Securities Services" \
      version="1.0.0" \
      description="BCP Securities Services Reporting Dashboard" \
      application="reporting-dashboard" \
      environment="production"

# Add build arguments for flexibility
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION

LABEL org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.version=$VERSION \
      org.label-schema.schema-version="1.0"
