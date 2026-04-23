# Echoes

## Project Overview

Echoes is a full-stack web platform designed to support unresolved missing persons cases in a more structured and ethically controlled way than general social media. It allows authorised representatives to publish and manage cases, moderators to oversee safety and moderation where needed, and public users to contribute through clearly separated channels for practical information and emotional support.

The platform was built around the idea that unresolved missing persons cases involve both an information problem and a human problem. Echoes therefore separates useful leads from emotional support, introduces role-based permissions, and embeds moderation into the structure of the system rather than treating it as an afterthought.

---

## Test Logins

You can either register a new account through the site, or use the following existing test accounts.

### Public User
- **Email:** echoespublic@gmail.com
- **Password:** EchoesPublic1

### Authorised Representative
- **Email:** echoesrepresentative@gmail.com
- **Password:** EchoesRepresentative1

### Moderator
Moderator accounts cannot be created through the normal registration page.

To test the moderator role, use:
- **Email:** echoesmoderator@gmail.com
- **Password:** EchoesModerator1

---

## What the Software Does

Echoes is a role-based web application for publishing and interacting with unresolved missing persons cases. It separates practical leads from emotional support, provides moderation tools, and keeps participation more structured and controlled than typical online discussion spaces.

Users can browse published cases, view detailed case pages, contribute in different ways depending on their role, and interact through controlled threaded discussion. Authorised representatives can manage the cases they own, while moderators can intervene where platform-wide oversight is needed.

---

## Technical Overview

### Frontend

The frontend was built using:
- **React**
- **Vite**
- **React Router**

It handles:
- page navigation
- role-based interface changes
- registration and login forms
- email verification flow during registration
- case browsing and case detail pages
- map display for published cases
- contribution forms and threaded replies
- personal account management
- wellness page features

### Backend

The backend was built using:
- **Node.js**
- **Express**

It handles:
- route logic
- authentication
- authorisation checks
- case creation, editing, and deletion
- contribution posting and deletion
- threaded replies
- moderation actions
- user blocking on a per-case basis
- reporting logic
- profile update routes
- email verification code generation and verification during registration

### Database

The system uses:
- **MongoDB**
- **Mongoose**

Main models include:
- `User`
- `Case`
- `Contribution`
- `CaseBlock`
- `EmailVerification`

### Authentication and Security

- authentication is handled using **JWT**
- passwords are stored as hashes rather than plain text
- public registration cannot create moderator accounts
- restricted actions are protected by backend role checks
- registration now includes **email verification by 6-digit code**
- verification records are stored temporarily in MongoDB before account creation is completed

### Upload and Content Filtering

- case image uploads are handled through the backend upload flow
- inappropriate or unsafe contribution content is filtered before submission
- comments can be removed automatically after repeated valid reports

---

## Core Features Implemented

- user registration and login
- email verification during registration
- three user roles:
  - Public User
  - Authorised Representative
  - Moderator
- missing person case submission
- browse page for published cases
- case details page
- map view using location-based markers
- separate contribution sections:
  - **Leads & Information**
  - **Support & Compassion**
- threaded replies under contributions
- authorised representatives can:
  - create cases
  - edit their own case
  - delete their own case
  - reply to contributions on their case
  - delete contributions on their case
  - delete their own replies
  - block users from interacting with their case
- public users can:
  - post contributions on cases
  - delete their own contributions
  - reply within threads when appropriate
  - delete their own replies
  - report harmful comments
- moderators can:
  - access moderation-related controls
  - review and act on moderated contribution activity
  - delete contributions
  - reply as moderator
  - submit cases where needed
- profile editing for name, email, and password
- wellness page with support resources, breathing exercise, affirmations, and calming music
- mandatory terms and conditions agreement during registration

---

## User Roles

### Public User

A public user can:
- browse cases
- post contributions under cases
- reply within threads when allowed
- delete their own contributions
- delete their own replies
- report comments
- edit personal details
- access the wellness page

A public user cannot:
- submit a missing person case
- register as a moderator
- manage someone else’s case

### Authorised Representative

An authorised representative can:
- submit missing person cases
- edit their own case
- delete their own case
- reply to contributions on their case
- delete contributions on their case
- delete their own replies
- block users from their case
- comment on other cases
- edit personal details
- access the wellness page

### Moderator

A moderator can:
- review moderation-related activity
- delete contributions
- reply as moderator
- submit cases if needed
- access broader moderation controls

Moderator accounts are not available through the public registration page and must be created manually in MongoDB.

---

## Registration Flow

Registration now happens in two stages rather than creating an account immediately.

1. The user fills in the registration form with name, email, password, and role.
2. The backend validates the input and sends a **6-digit verification code** to the submitted email address.
3. The user enters the code on the registration page.
4. Only after the correct code is submitted is the account actually created and the user logged in.

This was added to ensure that users can only register with an email address they actually control.

---

## Setup and Run Instructions

### 1. Prerequisites

Before running the project, install:
- **Node.js**
- **npm**
- **MongoDB Atlas** or another MongoDB connection
- **Git**
- **VS Code** or another editor

### 2. Open the Project

Clone the repository or open the project folder.

```bash
git clone https://github.com/mobinasharafi/Echoes_FinalProject.git
cd Echoes_FinalProject
