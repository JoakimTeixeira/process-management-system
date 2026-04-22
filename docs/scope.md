# Scope

This document presents the scoped problem areas that shape the system design. These problem areas are grouped into classifications to distinguish technical, governance, and broader organizational concerns. Each numbered section explains the problem, the corresponding requirement, the proposed solution, and the relevant COBIT practice together with its related activities, which provide governance and management guidance for the problem area.

The classifications used in this document are:

- `Core Technical and Structural Problems`: platform architecture, system behavior, and application capabilities
- `Governance and Management Problems`: ownership, control, monitoring, and organizational alignment concerns
- `Organizational and Contextual Problems`: broader business, communication, and enterprise constraints around the system

## 1. System Instability & Monolithic Architecture

- Priority: High
- Classification: Core Technical and Structural Problems
- COBIT 2019 Practice: BAI03.05 Build solutions
- Requirement Type: Non-functional
- Functionality / Quality Attribute: Reliability (Availability)

### Why It Is a Problem

The current static portal frequently goes offline for unknown reasons, lacking the redundancy to prevent downtime.

Furthermore, the frontend and backoffice are entirely disconnected; any processes added or updated during the day are only imported into the portal through a scheduled batch task that runs overnight, meaning users are regularly forced to work with information that is already out of date.

### Requirement Description

The runtime must separate database, API, public portal, and backoffice concerns into Docker services, front the application tier with stable entrypoints, and preserve PostgreSQL state in a named volume.

### Solution

The unstable legacy portal is replaced by a modern, decoupled runtime. The NestJS API, Angular public portal, Angular backoffice, and PostgreSQL database run as separate services, fronted by stable Nginx entrypoints.

PostgreSQL state is preserved through the named Docker volume `pgdata`, while the README and health endpoint provide the operational baseline for restart and maintenance.

This materially improves deployability and resilience, but it does not by itself implement automated backup scheduling, off-site retention, or a separate end-user manual.

### Required COBIT Level 2 Activities

1. Integrate and configure business and IT solution components and information repositories in line with detailed specifications and quality requirements. Consider the role of users, business stakeholders and the process owner in the configuration of business processes.

2. Complete and update business process and operational manuals, where necessary, to account for any customization or special conditions unique to the implementation.

3. Consider all relevant information control requirements in solution component integration and configuration. Include implementation of business controls, where appropriate, into automated application controls such that processing is accurate, complete, timely, authorized and auditable.

### Required COBIT Level 3 Activities

4. Implement audit trails during configuration and integration of hardware and infrastructural software to protect resources and ensure availability and integrity.

5. Consider when the effect of cumulative customizations and configurations (including minor changes that were not subjected to formal design specifications) requires a high-level reassessment of the solution and associated functionality.

6. Configure acquired application software to meet business processing requirements.

7. Define product and service catalogues for relevant internal and external target groups, based on business requirements.

8. Ensure the interoperability of solution components with supporting tests, preferably automated.

## 2. Unmaintainable Legacy Code & Lack of Source Control

- Priority: High
- Classification: Core Technical and Structural Problems
- COBIT 2019 Practice: BAI03.03 Develop solution components
- Requirement Type: Non-functional
- Functionality / Quality Attribute: Maintainability (Modifiability)

### Why It Is a Problem

The old process catalog was compiled in RStudio by a former employee. It is completely disconnected from the frontend, lacks source code control, and cannot be altered, making it an unmaintainable 'black box' that restricts the technical autonomy of the enterprise architecture team.

### Requirement Description

The codebase must be highly maintainable, transparent, and tracked via open-source version control.

### Solution

You will rebuild the system entirely from scratch using a transparent, open-source stack (Node.js, Angular, PostgreSQL).

This eliminates proprietary restrictions and standardizes the codebase on a single language ecosystem (TypeScript/JavaScript)

The entire stack will be placed under strict version control using a Git repository.

Additionally, you will implement Swagger (OpenAPI) in the NestJS backend to automatically generate interactive API documentation, ensuring the system remains completely transparent for future developers
.

### Required COBIT Level 2 Activities

1. Within a separate environment, develop the proposed detailed design for business processes, supporting services, applications, infrastructure and information repositories.

2. When third-party providers are involved with the solution development, ensure that maintenance, support, development standards and licensing are addressed and adhered to in contractual obligations.

3. Track change requests and design, performance and quality reviews. Ensure active participation of all impacted stakeholders.

4. Document all solution components according to defined standards. Maintain version control over all developed components and associated documentation.

### Required COBIT Level 3 Activities

5. Assess the impact of solution customization and configuration on the performance and efficiency of acquired solutions and on interoperability with existing applications, operating systems and other infrastructure. Adapt business processes as required to leverage the application capability.

6. Ensure that responsibilities for using high-security or restricted-access infrastructure components are clearly defined and understood by those who develop and integrate infrastructure components. Their use should be monitored and evaluated.

## 3. Absence of a Centralized Enterprise Process Catalog

- Priority: High
- Classification: Core Technical and Structural Problems
- COBIT 2019 Practice: BAI03.01 Design high-level solutions
- Requirement Type: Functional
- Functionality / Quality Attribute: Published Process and Procedure Catalogue

### Why It Is a Problem

Stakeholders have no centralized web tool or index page to easily view and comprehend the organization's processes at a glance.

Without a consolidated, accessible enterprise catalog, ordinary employees and decision-makers are left without a clear, high-level view of the organization's entire process landscape, severely hindering organizational transparency.

### Requirement Description

The system must provide a centralized public catalogue allowing users to search, filter, and consult published areas, processes, and procedures.

### Solution

The Angular public portal acts as the centralized catalogue for published repository content. It exposes published areas, processes, and procedures through dedicated catalogue routes, while the backing NestJS public endpoints provide the published data needed for consultation.

Navigation is supported by free-text search plus area and architecture filtering. BPMN rendering is available on the process-detail pages, together with overview, procedures, history, and compare views, rather than directly on the catalogue index page.

This gives stakeholders a centralized, read-only process consultation surface without claiming a broader enterprise dashboard than the repository design provides.

### Required COBIT Level 2 Activities

1. Establish a high-level design specification that translates the proposed solution into a high-level design for business processes, supporting services, workflows, applications, infrastructure, and information repositories capable of meeting business and enterprise architecture requirements.

2. Involve appropriately qualified and experienced user experience designers and IT specialists in the design process to make sure that the design provides a solution that optimally uses the proposed I&T capabilities to enhance the business process.

3. Create a design that complies with the organization's design standards. Ensure that it maintains a level of detail that is appropriate for the solution and development method and consistent with business, enterprise and I&T strategies, the enterprise architecture, security/privacy plan and applicable laws, regulations and contracts.

4. After quality assurance approval, submit the final high-level design to the project stakeholders and the sponsor/business process owner for approval based on agreed criteria. This design will evolve throughout the project as understanding grows.

### Required COBIT Level 3 Activities

None

## 4. Lack of Standardized Process Modeling Tools

- Priority: High
- Classification: Core Technical and Structural Problems
- COBIT 2019 Practice: BAI03.01 Design high-level solutions
- Requirement Type: Functional & Non-Functional
- Functionality / Quality Attribute: BPMN Upload Validation and Consultation Compatibility (Interoperability)

### Why It Is a Problem

Different departments map their processes using fragmented, non-standard tools (like Visio, Word, or Bizagi), leading to highly inconsistent documentation.

Because departments do not naturally align to a shared enterprise standard like Business Process Model and Notation (BPMN), the IT architecture team is forced to absorb this inconsistency, spending considerable time manually converting these scattered files into the official format

### Requirement Description

The upload flow must validate non-empty BPMN/XML files for draft versions and expose published BPMN content for governed consultation.

The organization must still enforce BPMN as the standard modeling approach outside the software itself.

### Solution

The repository design does not embed a full BPMN modeler in the backoffice. Instead, editors upload BPMN/XML files for draft versions, and the NestJS backend validates them before storage.

Uploaded BPMN assets are stored with checksum, size, file-path, and revision metadata, allowing preview in the backoffice and published BPMN consultation in the public portal.

This creates a governed BPMN repository and viewing flow without overstating the solution as a full in-browser modeling environment.

### Required COBIT Level 2 Activities

1. Establish a high-level design specification that translates the proposed solution into a high-level design for business processes, supporting services, workflows, applications, infrastructure, and information repositories capable of meeting business and enterprise architecture requirements.

2. Involve appropriately qualified and experienced user experience designers and IT specialists in the design process to make sure that the design provides a solution that optimally uses the proposed I&T capabilities to enhance the business process.

3. Create a design that complies with the organization's design standards. Ensure that it maintains a level of detail that is appropriate for the solution and development method and consistent with business, enterprise and I&T strategies, the enterprise architecture, security/privacy plan and applicable laws, regulations and contracts.

4. After quality assurance approval, submit the final high-level design to the project stakeholders and the sponsor/business process owner for approval based on agreed criteria. This design will evolve throughout the project as understanding grows.

### Required COBIT Level 3 Activities

None

## 5. Absence of Process Versioning and State Tracking

- Priority: High
- Classification: Core Technical and Structural Problems
- COBIT 2019 Practice: APO03.02 Define reference architecture
- Requirement Type: Functional
- Functionality / Quality Attribute: Process Versioning & Lifecycle State Machine

### Why It Is a Problem

The previous system had no version control, making it impossible to track historical changes or see how a process has evolved over time.

Without a structured state machine, the organization lacks a reliable way to distinguish clearly between current ("As-Is") operational processes and the optimized future ("To-Be") target states.

### Requirement Description

The system must track process lifecycle states, architecture states (`AS-IS` and `TO-BE`), version lineage, and published history.

### Solution

The repository uses a dedicated process-version model to track exact lifecycle states (`Draft`, `In Review`, `Approved`, `Published`, `Archived`) alongside architecture state (`AS-IS` or `TO-BE`) and lineage through `derived_from_version_id`.

The public portal exposes separate published `AS-IS` and `TO-BE` views, history, and compare routes, while the backoffice enforces governance actions, checklist completion, BPMN and procedure preconditions, and audit/state-history recording.

This row is supported by repository structures and UI views, but it does not include automated notifications or a broader enterprise architecture-governance workflow.

### Required COBIT Level 2 Activities

Not applicable. This management practice begins at level 3.

### Required COBIT Level 3 Activities

1. Maintain an architecture repository containing standards, reusable components, modeling artifacts, relationships, dependencies and views, to enable uniformity of architectural organization and maintenance.

2. Select reference viewpoints from the architecture repository that enable the architect to demonstrate how stakeholder concerns are addressed in the architecture.

3. For each viewpoint, select models needed to support the specific view required. Use selected tools or methods and the appropriate level of decomposition.

4. Develop baseline architectural domain descriptions, using the scope and level of detail necessary to support the target architecture and, to the extent possible, identifying relevant architecture building blocks from the architecture repository.

5. Maintain a process architecture model as part of the baseline and target domain descriptions. Standardize the descriptions and documentation of processes. Define the roles and responsibilities of the process decision makers, process owner, process users, process team and any other process stakeholders who should be involved.

6. Maintain an information architecture model as part of baseline and target domain descriptions, consistent with enterprise strategy to acquire, store and use data optimally in support of decision making.

7. Verify architecture models for internal consistency and accuracy. Perform a gap analysis between baseline and target. Prioritize gaps and define new or modified components that must be developed for the target architecture. Resolve incompatibilities, inconsistencies or conflicts within the target architecture.

8. Conduct a formal stakeholder review by vetting proposed architecture against the original intent of the architecture project and the statement of architecture work.

9. Finalize business, information, data, applications and technology domain architectures. Create an architecture definition document.

## 6. Vulnerability to Data Loss & Absence of Backups

- Priority: High
- Classification: Core Technical and Structural Problems
- COBIT 2019 Practice: APO14.10 Manage data backup and restore arrangements
- Requirement Type: Functional & Non-Functional
- Functionality / Quality Attribute: Volume Persistence and Recovery Documentation Reliability (Recoverability)

### Why It Is a Problem

The organization risks losing critical business data in the event of a system failure or data corruption due to the absence of scheduled backups and restore testing.

### Requirement Description

The repository must preserve database state through Docker volume persistence and documented rebuild/migrate/seed procedures; automated backup scheduling, off-site storage policy, and restore testing remain unimplemented.

### Solution

The repository preserves PostgreSQL state through the named Docker volume `pgdata` and documents rebuild, migrate, and seed procedures in the README.

This provides a basic persistence and recovery baseline, but it does not yet implement a scheduled backup routine, off-site retention controls, or restore-test scheduling. Those remain recognized limitations in the repository design rather than completed capabilities.

### Required COBIT Level 2 Activities

1. Define a schedule to ensure correct backup of all critical data.

2. Define requirements for on-site and off-site storage of backup data, taking into account volume, capacity and retention period, in alignment with the business requirements.

3. Establish a testing schedule for backup data. Ensure that the data can be restored correctly without drastically impacting business

### Required COBIT Level 3 Activities

None

## 7. Proprietary License Constraints for Viewing Enterprise Processes

- Priority: High
- Classification: Core Technical and Structural Problems
- COBIT 2019 Practice: BAI08.01 Identify and classify sources of information for governance and management of I&T
- Requirement Type: Functional
- Functionality / Quality Attribute: License-Free Process Consultation

### Why It Is a Problem

The organization's existing process management tool, requires paid user licenses, preventing ordinary employees from simply viewing enterprise processes.

While the tool is useful for the architecture team, its restrictive proprietary licensing model blocks regular staff from consulting process documentation, creating a massive bottleneck for the distribution of knowledge across the enterprise.

### Requirement Description

The system must allow employees to consult published process content without requiring paid licenses or backoffice access.

### Solution

The repository design exposes a read-only public Angular portal for published repository content. Employees can consult published processes, procedures, BPMN diagrams, history, compare views, and glossary terms without needing a licensed authoring tool or authenticated backoffice access.

This removes the paid-license bottleneck for consultation. However, the public portal does not provide export endpoints or download buttons for PDF, CSV, or JSON.

### Required COBIT Level 2 Activities

1. Identify potential knowledge users, including owners of information who may need to contribute and approve knowledge. Obtain knowledge requirements and sources of information from identified users.

2. Consider content types (procedures, processes, structures, concepts, policies, rules, facts, classifications), artefacts (documents, records, video, voice), and structured and unstructured information (experts, social media, email, voice mail, Rich Site Summary (RSS) feeds).

### Required COBIT Level 3 Activities

3. Classify sources of information based on a content classification scheme (e.g., information architecture model). Map sources of information to the classification scheme.

## 8. Unassigned Accountability & Lack of Process Ownership

- Priority: Medium
- Classification: Governance and Management Problems
- COBIT 2019 Practice: APO01.05 Establish roles and responsibilities
- Requirement Type: Functional & Non-Functional
- Functionality / Quality Attribute: Process Ownership Tracking Security (Accountability & Non-repudiation)

### Why It Is a Problem

In the legacy database, there is no clear mechanism or system field to identify the "owner" responsible for a process.

As a result, workflows exist without a formally accountable party to maintain or validate them, leading to unaccountable "orphan" processes.

### Requirement Description

The system must require accountable owner and team assignment for governed content and maintain auditable mutation and workflow history.

### Solution

The legacy repository allowed processes to exist without a clear accountable party. The repository design addresses this by requiring owner and team assignment on governed content, limiting governed mutations to authorized users from the same team, and recording audit logs plus version state history for key actions.

JWT-authenticated backoffice access ensures actions are attributable to the acting user, while workflow separation keeps accountability distinct from approval and publication authority. This creates visible ownership structures, even though the organization must still decide who the owners should be.

### Required COBIT Level 2 Activities

1. Establish, agree on and communicate I&T-related roles and responsibilities for all personnel in the enterprise, in alignment with business needs and objectives. Clearly delineate responsibilities and accountabilities, especially for decision making and approvals.

2. Consider requirements from enterprise and I&T service continuity when defining roles, including staff back-up and cross-training requirements.

3. Provide input to the I&T service continuity process by maintaining up-to-date contact information and role descriptions in the enterprise.

4. Include specific requirements in role and responsibility descriptions regarding adherence to management policies and procedures, the code of ethics, and professional practices.

5. Ensure that accountability is defined through roles and responsibilities.

6. Structure roles and responsibilities to reduce the possibility for a single role to compromise a critical process.

### Required COBIT Level 3 Activities

7. Implement adequate supervisory practices to ensure that roles and responsibilities are properly exercised, to assess whether all personnel have sufficient authority and resources to execute their roles and responsibilities, and generally to review performance. The level of supervision should be aligned with the sensitivity of the position and extent of assigned responsibilities.

## 9. Inconsistent Naming Conventions for Enterprise Teams

- Priority: Medium
- Classification: Governance and Management Problems
- COBIT 2019 Practice: APO01.05 Establish roles and responsibilities
- Requirement Type: Non-functional
- Functionality / Quality Attribute: Security (Confidentiality & Access Control)

### Why It Is a Problem

Different departments use completely different naming conventions for similar roles, referring to the same entities as "technical teams," "second-line teams," or "local support" depending on the area.

This lack of uniform nomenclature makes it incredibly difficult to map responsibilities consistently across the enterprise.

### Requirement Description

The system must standardize canonical team identities and enforce team-scoped authorization through Role-Based Access Control (RBAC).

### Solution

Different departments previously used inconsistent names for similar teams. The repository standardizes these through canonical team records and user-to-team assignment in the authenticated backoffice.

The backend guards and workflow-support services verify that the acting user belongs to the authorized team before allowing governed mutations, forcing the repository to use standardized team identities.

This strengthens accountability and access control without claiming SSO, OAuth, SAML, or Active Directory integration, which are out of scope for this repository design.

### Required COBIT Level 2 Activities

1. Establish, agree on and communicate I&T-related roles and responsibilities for all personnel in the enterprise, in alignment with business needs and objectives. Clearly delineate responsibilities and accountabilities, especially for decision making and approvals.

2. Consider requirements from enterprise and I&T service continuity when defining roles, including staff back-up and cross-training requirements.

3. Provide input to the I&T service continuity process by maintaining up-to-date contact information and role descriptions in the enterprise.

4. Include specific requirements in role and responsibility descriptions regarding adherence to management policies and procedures, the code of ethics, and professional practices.

5. Ensure that accountability is defined through roles and responsibilities.

6. Structure roles and responsibilities to reduce the possibility for a single role to compromise a critical process.

### Required COBIT Level 3 Activities

7. Implement adequate supervisory practices to ensure that roles and responsibilities are properly exercised, to assess whether all personnel have sufficient authority and resources to execute their roles and responsibilities, and generally to review performance. The level of supervision should be aligned with the sensitivity of the position and extent of assigned responsibilities.

## 10. Semantic Confusion in Process Hierarchy & Vocabulary

- Priority: Medium
- Classification: Governance and Management Problems
- COBIT 2019 Practice: APO14.02 Define and maintain a consistent business glossary
- Requirement Type: Functional
- Functionality / Quality Attribute: Standardized Taxonomy and Public Glossary

### Why It Is a Problem

Non-technical departments frequently struggle to distinguish between concepts like "macro-processes," "processes," and "procedures".

Furthermore, the organization lacks a common semantic vocabulary, heavily relying on a legacy document called the "Índice Estruturante" (Structural Index) that applies terminology directly conflicting with the ITIL 4 definitions

### Requirement Description

The system must enforce a standardized `Area -> Process -> Procedure` taxonomy and expose approved business terminology through a managed glossary.

### Solution

The legacy system suffered from semantic confusion around terms such as macro-processes, processes, and procedures. The repository addresses this through a fixed `Area -> Process -> Procedure` hierarchy, immutable generated codes, glossary terms, and ITIL-linked area terminology.

Relational integrity and normalized uniqueness rules prevent ad-hoc vocabulary drift, while the public glossary and business-facing consultation pages make the approved terminology visible to stakeholders.

This is stronger than simple navigation shaping alone because the glossary and taxonomy are both maintained as repository-level structures.

### Required COBIT Level 2 Activities

1. Ensure that standard business terms are readily available and communicated to relevant stakeholders.

2. Ensure that each business term added to the business glossary has a unique name and unique definition.

3. Use standard industry business terms and definitions, as appropriate, in the business glossary.

### Required COBIT Level 3 Activities

4. Establish, document and follow a process to define, manage, use and maintain the business glossary. For example, new initiatives should apply standard business terms as part of the data requirements definition process to ensure consistency of language. This will help achieve comparability of the content and facilitate data sharing across the organization.

5. Ensure that new development, data integration and data consolidation efforts apply standard business terms as part of the data requirements definition process.

6. Integrate the business glossary into the organization's metadata repository, with appropriate access permissions.

## 11. Rigid IT Systems Dictating Business Processes

- Priority: Medium
- Classification: Governance and Management Problems
- COBIT 2019 Practice: APO02.01 Understand enterprise context and direction
- Requirement Type: Non-functional
- Functionality / Quality Attribute: Portability (Adaptability)

### Why It Is a Problem

Historically, the organization operated on a "bottom-up" methodology, where rigid technological constraints were defined first, and the business processes were forced to adapt around them.

This frequently resulted in IT systems that failed to adequately support the business.

### Requirement Description

The system architecture must continuously align with and adapt to the defined business processes.

### Solution

In the legacy situation, technology constrained how the business had to operate. The repository design reverses that by grounding the repository design in stakeholder interviews, iterative validation, and explicit current-state versus target-state versioning.

The `AS-IS` / `TO-BE` distinction, change-description fields, reason-for-change tracking, and compare views help the repository reflect business-defined evolution rather than forcing a fixed legacy structure onto the organization.

This support is still partial because the broader enterprise-context and strategic-alignment work remains organizational rather than fully embedded in the application.

### Required COBIT Level 2 Activities

1. Develop and maintain an understanding of the external environment of the enterprise.

2. Develop and maintain an understanding of the current way of working, including the operational environment, enterprise architecture (business, information, data, applications and technology domains), enterprise culture and current challenges.

3. Develop and maintain an understanding of future enterprise direction, including enterprise strategy, goals and objectives. Understand the ambition level of the enterprise in terms of digitization, which may include a range of increasingly aspirational goals, from cutting costs, increasing customer centricity, or getting to market faster by digitizing internal operations, to creating entirely new revenue streams from new business models (e.g., platform business).

4. Identify key stakeholders and obtain insight on their requirements.

### Required COBIT Level 3 Activities

None

## 12. Inaccessible IT Jargon Hindering Non-Technical Process Mapping

- Priority: Low
- Classification: Organizational and Contextual Problems
- COBIT 2019 Practice: APO08.01 Understand business expectations
- Requirement Type: Non-functional
- Functionality / Quality Attribute: Usability (Accessibility)

### Why It Is a Problem

When the IT architecture team attempts to map processes across non-technical departments (like Human Resources or Finance), communication barriers emerge that slow the effort at every stage.

The organization relies heavily on ITIL 4, whose terminology is highly specific to IT professionals and largely inaccessible to regular employees, creating a semantic barrier that prevents non-technical staff from autonomously mapping their own workflows.

### Requirement Description

The user interface must be accessible, intuitive, and shield non-technical business departments from IT complexity

### Solution

The public portal reduces the semantic barrier created by technical terminology through business-facing labels, glossary exposure, methodology and FAQ pages, and simple read-only process consultation routes.

By avoiding backend jargon in the consultation layer and exposing standardized terminology directly in the UI, the repository becomes more usable to non-technical stakeholders.

This improves accessibility without claiming a comments, chat, or centralized feedback subsystem, which is out of scope for the repository design.

### Required COBIT Level 2 Activities

1. Identify business stakeholders, their interests and their areas of responsibilities.

2. Review current enterprise direction, issues, strategic objectives, and alignment with enterprise architecture.

3. Understand the current business environment, process constraints or issues, geographical expansion or contraction, and industry/regulatory drivers.

4. Maintain an awareness of business processes and associated activities. Understand demand patterns that relate to service volumes and use

### Required COBIT Level 3 Activities

5. Manage expectations by ensuring that business units understand priorities, dependencies, financial constraints and the need to
   schedule requests.

## 13. Informal IT Support Requests Bypassing Official Ticketing Systems

- Priority: Out of Scope
- Classification: Organizational and Contextual Problems
- COBIT 2019 Practice: DSS02.02 Record, classify and prioritize requests and incidents
- Requirement Type: Non-functional
- Functionality / Quality Attribute: IT Service Management (Out of Scope)

### Why It Is a Problem

Users frequently bypass the organization's official IT Service Management (ITSM) tool, and submit IT support requests informally by phone calls, direct emails, or mailing lists.

Because requests are managed ad-hoc, there is no way to properly categorize them, track performance metrics, or ensure compliance with Service Level Agreements (SLAs).

### Requirement Description

Support requests must be routed through the official IT Service Management (ITSM) ticketing tool (Out of Scope).

### Solution

Out of CMS scope.

The solution lies in organizational enforcement rather than new software development. Management must mandate the strict use of the existing ITSM tool (EasyVista) for all daily IT support requests to ensure proper logging, routing, and ticket prioritization.

### Required COBIT Level 2 Activities

1. Log all service requests and incidents, recording all relevant information, so they can be handled effectively and a full historical
   record can be maintained.

2. To enable trend analysis, classify service requests and incidents by identifying type and category.

3. Prioritize service requests and incidents based on the SLA service definition of business impact and urgency.

### Required COBIT Level 3 Activities

None

## 14. Lack of Practical Monitoring for Process Compliance

- Priority: Out of Scope
- Classification: Organizational and Contextual Problems
- COBIT 2019 Practice: MEA01.01 Establish a monitoring approach
- Requirement Type: Functional
- Functionality / Quality Attribute: KPI Dashboards & Reports (Out of Scope)

### Why It Is a Problem

The organization faces significant difficulty in monitoring whether the different departments are actually complying with the formally documented processes and consistently applying them in their daily routines.

There is a lack of clear KPIs to track practical implementation across different teams.

### Requirement Description

The organization must establish KPI dashboards and reports to monitor practical process compliance (Out of Scope).

### Solution

Out of CMS scope.

Implementation tracking, team KPIs, and compliance dashboards are meant to be managed by the organization's process repository tool and broader performance management systems.

Solving this requires engaging management stakeholders to actively monitor routine compliance in daily workflows.

### Required COBIT Level 2 Activities

1. Identify stakeholders (e.g., management, process owners and users).

2. Engage with stakeholders and communicate the enterprise requirements and objectives for monitoring, aggregating and reporting, using common definitions (e.g., business glossary, metadata and taxonomy), baselining and benchmarking.

3. Align and continually maintain the monitoring and evaluation approach with the enterprise approach and the tools to be used for data gathering and enterprise reporting (e.g., business intelligence applications).

4. Agree on the types of goals and metrics (e.g., conformance, performance, value, risk), taxonomy (classification and relationships between goals and metrics) and data (evidence) retention.

5. Request, prioritize and allocate resources for monitoring, consider appropriateness, efficiency, effectiveness and confidentiality

### Required COBIT Level 3 Activities

6. Periodically validate the approach used and identify new or changed stakeholders, requirements and resources.

7. Agree on a life cycle management and change control process for monitoring and reporting. Include improvement opportunities for reporting, metrics, approach, baselining and benchmarking.

## 15. Lack of a Governance Framework for Non-IT Processes

- Priority: Out of Scope
- Classification: Organizational and Contextual Problems
- COBIT 2019 Practice: APO01.01 Design the management system for enterprise I&T
- Requirement Type: Non-functional
- Functionality / Quality Attribute: Organizational Compliance & Governance (Out of Scope)

### Why It Is a Problem

While the ITIL 4 framework serves the organization well for managing IT services, its scope is strictly confined to procedural execution within the IT domain.

As a result, the organization struggles with surveying, standardizing, and governing non-IT related processes (such as HR, financial, or asset management) because it lacks a dedicated framework for non-technological operations.

### Requirement Description

The enterprise must adopt a standard governance framework for non-IT processes (Out of Scope).

### Solution

Out of CMS scope.

COBIT 2019 is a framework specifically designed for the governance of Information & Technology.

To solve this enterprise-wide gap, the business units must adopt and enforce dedicated non-IT business process frameworks, such as BPM CBOK (Business Process Management Common Body of Knowledge)
.

### Required COBIT Level 2 Activities

1. Obtain an understanding of the enterprise vision, direction and strategy as well as the current enterprise context and challenges.

2. Consider the enterprise's internal environment, including management culture and philosophy, risk tolerance, security and privacy policy, ethical values, code of conduct, accountability, and requirements for management integrity.

3. Apply the COBIT goals cascade and design factors to the enterprise strategy and context to decide on priorities for the management system and, thus, for implementation of management objective priorities.

### Required COBIT Level 3 Activities

4. Validate selected priorities for implementation of management objectives with industry-specific good practices or requirements (e.g., industry-specific regulations) and with appropriate governance structures.
