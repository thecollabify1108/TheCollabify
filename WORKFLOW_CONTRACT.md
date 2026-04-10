# TheCollabify Workflow Contract

Version: 1.0
Date: 2026-04-10
Status: Launch reference

## Scope Exclusions (Current)
The following areas are intentionally excluded from this workflow contract until re-enabled:
- Google login/signup flow
- Payment integration and escrow gateway execution
- Instagram API verification/integration layer

## 1. Purpose
This document defines the functional workflow for both roles (Seller and Creator):
- What happens after login
- What happens after campaign launch
- How users connect
- Which details are required while launching campaigns and sending collaboration requests

This is a product and engineering contract for launch readiness.

## 2. Roles and Core Entities
Roles:
- Seller
- Creator
- Admin (out of scope for this workflow)

Core entities:
- PromotionRequest (campaign)
- MatchedCreator (match between campaign and creator)
- Conversation (chat thread)
- Message
- Collaboration and EscrowPayment

Primary status enums in backend:
- CampaignStatus: OPEN, CREATOR_INTERESTED, ACCEPTED, COMPLETED, CANCELLED
- MatchStatus: MATCHED, INVITED, APPLIED, ACCEPTED, REJECTED
- ConversationStatus: PENDING, ACTIVE, CLOSED, ARCHIVED

## 3. Post-Login Behavior
### 3.1 Authentication and Role
After successful login/registration/OAuth:
- Token is persisted
- User is normalized with activeRole into lower-case role
- Role-based dashboard experience is rendered

### 3.2 Seller Dashboard Main Tabs
- Home
- Stats
- Nearby
- Matches
- Chat

### 3.3 Creator Dashboard Main Tabs
- Home
- Jobs
- Stats
- Chat
- Profile

## 4. Seller Campaign Launch Workflow
## 4.1 Trigger
Seller launches campaign via campaign wizard and submits to sellers request API.

## 4.2 Required Campaign Inputs (validated)
- title: 5 to 100 chars
- description: 20 to 1000 chars
- budgetRange.min: number >= 0
- budgetRange.max: number >= 0
- promotionType: one or more valid values (REELS, STORIES, POSTS, WEBSITE_VISIT)
- targetCategory: array with at least one category
- campaignGoal: mapped into allowed goals

## 4.3 Optional Campaign Inputs
- brandName (max 50 chars)
- followerRange.min
- followerRange.max
- deadline
- location and locationType (from UI payload)
- requirements (UI payload)

## 4.4 Immediate System Effects after Launch
- PromotionRequest is created with status OPEN
- AI matching runs to identify creators
- MatchedCreator records are created/updated from matching results
- Notifications/emails are attempted in fail-safe mode

## 5. Creator Profile Onboarding Workflow
To become matchable and collaboration-ready, creator profile creation requires:
- category
- promotionTypes (at least one)
- priceRange.min
- priceRange.max
- instagramProfileUrl
- location.city
- followerRange

Optional creator inputs:
- engagementRate
- bio
- portfolioLinks
- willingness to travel
- collaborationTypes
- content types and experience details

System outputs from profile creation:
- follower range normalization
- AI insight generation
- profile completion calculation
- availability and reliability/risk computation hooks

## 6. Connection and Collaboration Workflow
There are two connection paths.

### 6.1 Path A: Campaign-based Collaboration Invite
Seller sends collaboration request with:
- promotionId (required)
- creatorId (required)

Rules:
- Seller must own promotion
- Existing match is required for invite update
- Match status moves to INVITED

### 6.2 Path B: Direct Message Request/Contact Creator
Seller starts message request with:
- creatorId (required)
- promotionId (optional)

Rules:
- If conversation exists, it is reused/activated
- If promotionId is missing, system derives or creates fallback campaign linkage
- Conversation is created ACTIVE for direct outreach flow
- Match is created or aligned to ACCEPTED for chat continuity

## 7. Chat Workflow and Guardrails
## 7.1 Chat Access Rules
To send a message:
- User must belong to conversation
- Related match must be ACCEPTED
- Conversation status must be ACTIVE

## 7.2 Moderation and Pre-Escrow Controls
Before escrow unlock:
- Per-user pre-escrow message limit is enforced
- Links are blocked
- Non-text attachments are blocked
- Privacy-violation content is replaced with policy deletion message

## 7.3 Chat UX Capabilities
- Message send
- Reply
- Edit/delete own message
- Delivery/read indicators
- One-sided conversation deletion from inbox

## 8. Deletion and Visibility Rules
Conversation deletion in chat list is one-sided:
- Deletion creates/updates per-user ConversationDeletion record
- Other participant still retains conversation
- Conversation list excludes deleted threads for that user
- Restore path removes user deletion record

## 9. End-to-End Journey (Launch Scenario)
1. User logs in and lands on role dashboard.
2. Seller launches campaign with required targeting and budget fields.
3. System opens campaign and runs matching.
4. Seller invites creator or starts direct message request.
5. Conversation becomes active and parties negotiate in chat.
6. Creator and seller proceed toward accepted collaboration.
7. Escrow unlock transitions chat restrictions to full mode.
8. Collaboration completes and outcomes feed analytics.

## 10. Data Contract Summary
### 10.1 Seller campaign launch payload (conceptual)
- title
- description
- budgetRange: { min, max }
- promotionType: []
- targetCategory: []
- followerRange: { min, max } optional
- campaignGoal
- deadline optional
- location optional

### 10.2 Seller collaboration request payload (campaign path)
- promotionId
- creatorId

### 10.3 Seller message request payload (direct path)
- creatorId
- promotionId optional

### 10.4 Creator profile payload (minimum)
- category
- promotionTypes
- priceRange: { min, max }
- instagramProfileUrl
- location.city
- followerRange

## 11. Launch Notes
- Platform warnings in cloud dashboard about health checks/instance count are infrastructure configuration tasks, not necessarily app-code defects.
- Chat reliability depends on accepted match state, active conversation state, and cache invalidation on mutation paths.

## 12. Source-of-Truth Implementation Files
- backend/prisma/schema.prisma
- backend/routes/sellers.js
- backend/routes/creators.js
- backend/routes/chat.js
- frontend/src/pages/SellerDashboard.jsx
- frontend/src/pages/CreatorDashboard.jsx
- frontend/src/components/seller/EnhancedCampaignWizard.jsx
- frontend/src/context/AuthContext.jsx
