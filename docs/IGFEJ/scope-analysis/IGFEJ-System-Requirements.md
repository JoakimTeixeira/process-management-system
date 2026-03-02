# IGFEJ Process Management System Requirements

> **Source**: Requirements extracted and compiled from IGFEJ meeting transcripts in the `meetings/` folder

## Overview

The IGFEJ team wants a process management system that serves as a public portal for consultation and documentation of business processes of the Ministry of Justice.

## Specific Requirements

### 1. Process Portal (Public Front-end)

- **Public consultation** of processes and procedures
- **Open access** without authentication for viewing
- **Hierarchical structure** (macroprocesses → processes → subprocesses → procedures)
- **Visualization of BPMN diagrams** and associated documentation
- **Simple and intuitive interface** for all justice sectors
- **FAQ section** with common questions and answers
- **Visual differentiation** between processes and procedures
- **Clear visual hierarchy** to help other teams understand the structure
- **Version selection interface** for teams to view different process versions
- **Version history display** showing evolution of processes over time

### 2. Management System (Back-office)

- **CRUD operations** for process administration
- **Version control** and versioning
- **Change history** (who changed, when, why)
- **Version comparison** between different versions
- **Approval cycle** (draft → review → approved → published)
- **User management** with different roles (administrator, editor, viewer)
- **VPN-based authentication** with IP whitelist access control
- **Automatic admin privileges** for users with VPN access to backoffice URL

### 3. Integration with Existing Tools

- **BPMN** - visualization of BPMN diagrams
- **Frontend**: Will be developed from scratch
- **Database** (PostgreSQL with backup system)

### 4. Technological Improvements

- **Migrate from RStudio** to modern technology (Angular/React)
- **Implement DevOps** with automated pipelines
- **Separate front-end and back-end**
- **Improve performance** and optimize database

## Current Problems to be Solved

- **Technical dependency** - current system depends on a colleague who left
- **Manual process** - insertion via Excel/Power Apps is laborious
- **Lack of integration** - tools don't communicate with each other
- **RStudio limitations** - obsolete and inflexible technology

## Important Non-Functional Requirements

- **Auditability** - traceability of all changes
- **Security** - VPN-based access control with IP whitelist
- **Maintainability** - clean and well-structured code
- **Performance** - fast response for process consultation
- **Availability** - system always accessible for consultation
- **Network-level authentication** - VPN access grants automatic admin privileges
- **IP-based authorization** - whitelist-based access control

## What they expect from you

- **Replicate the current portal** in modern technology
- **Create the back-office** for process management
- **Integrate with COBIT/ITIL** for best practices
- **Develop functional prototype** quickly
- **Focus on usability** and user experience
- **Ensure visual clarity** between processes and procedures
- **Include FAQ functionality** for user support
- **Implement version selection** for public process viewing
- **Provide version history** for process evolution tracking
- **Implement VPN-based authentication** for backoffice access
- **Create IP whitelist access control** for secure network access
