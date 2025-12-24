Understood. Given the structure of this IV test (15 minutes to read, followed by a 15–20 minute technical Q&A **before** coding), the quality of your **clarification questions** will materially affect both your design decisions and the interviewer’s evaluation of your engineering maturity.

Below is a **structured, high-signal question set** you can selectively use during the clarification phase. These questions are aligned with **ELID’s domain (cloud access control)** and the **assessment criteria implicit in the test format**.

---

## 1. Business & Functional Scope Clarification

(Ask these first — they show product thinking and prevent over-engineering.)

1. **Primary use case**

   * “What is the primary user role for this application (e.g., system admin, operator, end user), and should I focus on a single role for this test?”

2. **Core feature priority**

   * “Among the listed features in the problem statement, which are considered *must-have* versus *nice-to-have* for evaluation?”

3. **Success criteria**

   * “What would you consider a *successful submission* within the two-hour window — correctness, completeness, or architectural clarity?”

4. **Domain assumptions**

   * “Should I assume this system is part of an access control platform (e.g., users, devices, permissions), or should I treat it as a generic CRUD application?”

---

## 2. Data Model & Persistence

(These demonstrate backend fundamentals and pragmatic trade-offs.)

5. **Database expectations**

   * “Do you have a preferred database type for the test (PostgreSQL, MySQL, SQLite), or may I choose what fits best?”

6. **Data volume assumptions**

   * “Should I assume small-scale data suitable for local development, or design with scalability considerations in mind?”

7. **Schema flexibility**

   * “Is it acceptable to simplify the data model for the sake of time, as long as relationships and constraints are clear?”

8. **Migrations**

   * “Do you expect database migrations to be included, or is inline schema initialization acceptable?”

---

## 3. API Design & Backend Behavior

(These questions position you as someone who builds production systems.)

9. **API style**

   * “Should the backend follow a RESTful design strictly, or is flexibility acceptable as long as endpoints are well-structured?”

10. **Authentication**

    * “Is authentication required for this test, or should I focus on core functionality and assume a trusted environment?”

11. **Validation & error handling**

    * “How important is robust error handling and request validation in your evaluation criteria?”

12. **Concurrency or background jobs**

    * “Do you expect any asynchronous processing (e.g., background tasks), or should everything remain synchronous?”

---

## 4. Frontend Expectations

(Helps you avoid wasting time on UI polish that is not evaluated.)

13. **UI depth**

    * “Is the frontend expected to be production-polished, or is a functional and clean interface sufficient?”

14. **Framework freedom**

    * “Is there any preference between React, Angular, or Vue for this assessment, or is the choice purely up to me?”

15. **State management**

    * “Should state management be minimal, or would you like to see a more structured approach?”

---

## 5. Docker & Environment Setup

(Very important, since Docker is explicitly required.)

16. **Docker scope**

    * “Should the entire stack (frontend, backend, database) be containerized via Docker Compose?”

17. **One-command startup**

    * “Is the expectation that the application can be started with a single command (e.g., `docker-compose up`)?”

18. **Production vs dev config**

    * “Is a development-only Docker configuration acceptable for this test?”

---

## 6. Testing, Documentation & Quality

(Ask at least one — shows senior thinking even as a junior.)

19. **Testing expectations**

    * “Are automated tests required, or would you prefer to see clean, readable code with manual testability?”

20. **Documentation**

    * “What level of documentation would you like — README only, or inline code comments as well?”

21. **Trade-off explanation**

    * “Would you like me to explicitly explain design trade-offs during the coding phase?”

---

## 7. Evaluation & Communication

(These questions directly align with how you are being assessed.)

22. **Assessment focus**

    * “During the coding session, are you evaluating more on problem-solving approach or on final completeness?”

23. **Refactoring**

    * “If time runs short, is it better to finish features or refactor existing code for clarity?”

24. **AI usage**

    * “Since AI tools are allowed, would you like me to verbalize how I’m validating AI-generated code?”
