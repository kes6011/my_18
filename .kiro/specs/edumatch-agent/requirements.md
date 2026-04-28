# Functional Requirements

## 1. Opportunity Management
- The system must display a list of educational programs.
- Users can add new notices manually through a modal interface.
- Data must persist across browser sessions using `localStorage` (key: `edumatch.opportunities`).

## 2. Filtering & Search
- Users can filter programs by category (AI, Cloud, GitHub, Hackathon, etc.).
- Users can filter by matching status (Matched, Conflict, Pending, Closed).
- Real-time text search across titles and descriptions.

## 3. Intelligent Analysis
- **Status Assignment**:
    - `MATCHED`: High alignment with skills and no schedule overlap.
    - `SCHEDULE_CONFLICT`: Program overlaps with existing user commitments.
    - `REVIEW_REQUIRED`: Requires manual capability assessment.
    - `DEADLINE_PASSED`: Date checking against system clock.

## 4. Application Support
- Generate specialized email drafts based on program metadata and user preparation.
- Copy-to-clipboard functionality for ready-to-send drafts.
