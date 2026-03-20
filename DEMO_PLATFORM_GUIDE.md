# TheCollabify Demo Platform - Complete Setup Guide 🎯

## Overview

This demo platform provides a **fully functional, working environment** for testing the complete seller-creator collaboration workflow. No OTP verification required—just register, create campaigns, and start messaging!

---

## Quick Start (2 Minutes)

### 1. **Create Demo Users & Data**

Make a POST request to:
```
POST /api/demo/create-demo-users
```

**Response includes:**
- ✅ 1 Seller user (Fashion Brand Co)
- ✅ 3 Creator users (different categories)
- ✅ 1 Campaign with creators matched
- ✅ Conversation with messages already in place
- ✅ Active collaboration in progress
- ✅ JWT tokens for immediate login (no password needed!)

**Example:**
```bash
curl -X POST http://localhost:8080/api/demo/create-demo-users
```

---

## Complete User Workflows

### **WORKFLOW 1: Seller (Brand) Perspective**

#### Step 1: Register as Seller
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d {
    "email": "mybrand@test.com",
    "name": "My Fashion Brand",
    "password": "TestPassword@123",
    "role": "seller"
  }
```
**Response:** Token & user data (NO OTP verification needed!)

#### Step 2: Create Your Brand Profile
```bash
curl -X POST http://localhost:8080/api/sellers/profile \
  -H "Authorization: Bearer [YOUR_TOKEN]" \
  -H "Content-Type: application/json" \
  -d {
    "companyName": "My Fashion Brand",
    "industry": "Fashion",
    "websiteUrl": "https://mybrand.com",
    "description": "Premium fashion for creators",
    "logo": "https://via.placeholder.com/200",
    "budget": 10000,
    "monthlyBudget": 2000
  }
```

#### Step 3: Create Campaign
```bash
curl -X POST http://localhost:8080/api/sellers/campaign \
  -H "Authorization: Bearer [YOUR_TOKEN]" \
  -H "Content-Type: application/json" \
  -d {
    "title": "Summer Collection Campaign",
    "description": "Looking for creators to showcase summer collection",
    "promotionType": "POSTS",
    "category": "FASHION",
    "budget": 5000,
    "campaignGoal": "REACH",
    "startDate": "2024-01-15",
    "endDate": "2024-02-15",
    "requirements": {
      "minFollowers": 50000,
      "minEngagementRate": 5
    }
  }
```
**Response:** Campaign created with ID

#### Step 4: View Matched Creators
```bash
curl -X GET "http://localhost:8080/api/sellers/campaign/[CAMPAIGN_ID]/matches" \
  -H "Authorization: Bearer [YOUR_TOKEN]"
```
**Response:** List of AI-matched creators ranked by fit

#### Step 5: Message Creator
```bash
curl -X POST http://localhost:8080/api/chat/message-request \
  -H "Authorization: Bearer [YOUR_TOKEN]" \
  -H "Content-Type: application/json" \
  -d {
    "creatorId": "[CREATOR_ID]",
    "promotionId": "[CAMPAIGN_ID]",
    "message": "Hey! We love your content. Want to collaborate on our summer campaign?"
  }
```
**Response:** Conversation created with message

#### Step 6: Continue Conversation
```bash
curl -X POST http://localhost:8080/api/chat/[CONVERSATION_ID]/message \
  -H "Authorization: Bearer [YOUR_TOKEN]" \
  -H "Content-Type: application/json" \
  -d {
    "content": "We offer $1500 for 2 posts and 1 reel. Timeline: 2 weeks."
  }
```

#### Step 7: Review Collaboration Status
```bash
curl -X GET "http://localhost:8080/api/sellers/collaborations" \
  -H "Authorization: Bearer [YOUR_TOKEN]"
```
**Response:** All collaborations with status & milestones

---

### **WORKFLOW 2: Creator Perspective**

#### Step 1: Register as Creator
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d {
    "email": "creator@test.com",
    "name": "Sarah Content Creator",
    "password": "TestPassword@123",
    "role": "creator"
  }
```
**Response:** Token & user data (NO OTP!)

#### Step 2: Complete Creator Profile
```bash
curl -X POST http://localhost:8080/api/creators/profile \
  -H "Authorization: Bearer [YOUR_TOKEN]" \
  -H "Content-Type: application/json" \
  -d {
    "instagramUsername": "@sarahcreator",
    "instagramProfileUrl": "https://instagram.com/sarahcreator",
    "followerCount": 150000,
    "engagementRate": 8.5,
    "category": "FASHION",
    "promotionTypes": ["POSTS", "REELS", "STORIES"],
    "minPrice": 500,
    "maxPrice": 3000,
    "bio": "Fashion & lifestyle creator",
    "availabilityStatus": "AVAILABLE_NOW",
    "strengths": ["Photography", "Storytelling", "Engagement"]
  }
```

#### Step 3: Browse Available Campaigns
```bash
curl -X GET "http://localhost:8080/api/creators/campaigns?category=FASHION&sortBy=recent" \
  -H "Authorization: Bearer [YOUR_TOKEN]"
```
**Response:** List of open campaigns matching your profile

#### Step 4: View Campaign Details
```bash
curl -X GET "http://localhost:8080/api/creators/campaigns/[CAMPAIGN_ID]" \
  -H "Authorization: Bearer [YOUR_TOKEN]"
```
**Response:** Full campaign details, budget, requirements, matched creators

#### Step 5: Receive Messages from Sellers
```bash
curl -X GET "http://localhost:8080/api/chat/conversations" \
  -H "Authorization: Bearer [YOUR_TOKEN]"
```
**Response:** All conversations grouped by status (NEW, ACTIVE, ACCEPTED, COMPLETED)

#### Step 6: Reply to Offer
```bash
curl -X POST http://localhost:8080/api/chat/[CONVERSATION_ID]/message \
  -H "Authorization: Bearer [YOUR_TOKEN]" \
  -H "Content-Type: application/json" \
  -d {
    "content": "Sounds great! I'm interested. When do you need the content delivered?"
  }
```

#### Step 7: Accept Collaboration Offer
```bash
curl -X POST http://localhost:8080/api/chat/[CONVERSATION_ID]/accept \
  -H "Authorization: Bearer [YOUR_TOKEN]" \
  -H "Content-Type: application/json" \
  -d {
    "agreedAmount": 1500,
    "startDate": "2024-01-20",
    "endDate": "2024-02-03"
  }
```
**Response:** Collaboration created with status IN_PROPOSAL → IN_DISCUSSION → AGREED

#### Step 8: Track Collaboration Milestones
```bash
curl -X GET "http://localhost:8080/api/creators/collaborations" \
  -H "Authorization: Bearer [YOUR_TOKEN]"
```
**Response:** All your collaborations with:
- Payment status
- Deliverables due
- Milestones to complete
- Messages from brand

---

## Demo Data Summary

When you run `/api/demo/create-demo-users`, you get:

| User | Email | Password | Role |
|------|-------|----------|------|
| Seller | demo-seller-[timestamp]@test.com | DemoSeller@123 | SELLER |
| Creator 1 | demo-creator-@sarahfashion-[timestamp]@test.com | DemoCreator@123 | CREATOR |
| Creator 2 | demo-creator-@alexlifestyle-[timestamp]@test.com | DemoCreator@123 | CREATOR |
| Creator 3 | demo-creator-@mayabeauty-[timestamp]@test.com | DemoCreator@123 | CREATOR |

**Pre-Created Assets:**
- ✅ 1 Campaign (Summer Collection)
- ✅ 3 Matched Creators (85-100 match score)
- ✅ 1 Conversation with 3 sample messages
- ✅ 1 Active Collaboration (2 milestones)

---

## API Endpoints - Complete Reference

### Demo Management
```
POST   /api/demo/create-demo-users          → Create complete demo environment
GET    /api/demo/demo-users                 → List all demo users
POST   /api/demo/clean-demo-data            → Delete all demo data
POST   /api/demo/test-message-flow          → Test message exchange
```

### Authentication (No OTP Required!)
```
POST   /api/auth/register                   → Register (seller or creator)
POST   /api/auth/login                      → Login
POST   /api/auth/logout                     → Logout
GET    /api/auth/me                         → Get current user
```

### Seller Routes
```
POST   /api/sellers/profile                 → Create/update brand profile
GET    /api/sellers/profile                 → Get brand profile
POST   /api/sellers/campaign                → Create new campaign
GET    /api/sellers/campaign/[ID]/matches   → Get matched creators
GET    /api/sellers/campaigns               → List for seller's campaigns
GET    /api/sellers/collaborations          → Get collaboration status
```

### Creator Routes
```
POST   /api/creators/profile                → Create/update creator profile
GET    /api/creators/profile                → Get creator profile
GET    /api/creators/campaigns              → Browse open campaigns
GET    /api/creators/campaigns/[ID]         → Get campaign details
GET    /api/creators/collaborations         → Get collaboration status
```

### Chat & Messaging
```
GET    /api/chat/conversations              → List conversations
POST   /api/chat/message-request            → Start new conversation
POST   /api/chat/[ID]/message               → Send message
GET    /api/chat/[ID]/messages              → Get conversation history
POST   /api/chat/[ID]/accept                → Accept offer & create collaboration
```

---

## Common Workflows - Code Examples

### **Quick Demo: From 0 to Live Conversation (5 minutes)**

```bash
#!/bin/bash

# 1. Create everything at once
echo "Creating demo environment..."
RESPONSE=$(curl -s -X POST http://localhost:8080/api/demo/create-demo-users)
SELLER_ID=$(echo $RESPONSE | jq -r '.data.seller.userId')
CREATOR_ID=$(echo $RESPONSE | jq -r '.data.creators[0].userId')
SELLER_TOKEN=$(echo $RESPONSE | jq -r '.data.seller.token')
CREATOR_TOKEN=$(echo $RESPONSE | jq -r '.data.creators[0].token')
CAMPAIGN_ID=$(echo $RESPONSE | jq -r '.data.campaign.id')
CONV_ID=$(echo $RESPONSE | jq -r '.data.conversation.id')

echo "✅ Demo created!"
echo "Seller: $SELLER_ID ($SELLER_TOKEN)"
echo "Creator: $CREATOR_ID ($CREATOR_TOKEN)"
echo "Campaign: $CAMPAIGN_ID"
echo "Conversation: $CONV_ID"

# 2. Seller sends message
echo ""
echo "Seller sending offer..."
curl -X POST http://localhost:8080/api/chat/$CONV_ID/message \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hi! Interested in our campaign?"}'

# 3. Creator replies
echo ""
echo "Creator replying..."
curl -X POST http://localhost:8080/api/chat/$CONV_ID/message \
  -H "Authorization: Bearer $CREATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Yes! Tell me more about the budget."}'

# 4. Get conversation
echo ""
echo "Fetching conversation..."
curl -X GET http://localhost:8080/api/chat/$CONV_ID/messages \
  -H "Authorization: Bearer $SELLER_TOKEN"

echo ""
echo "✅ Demo complete! Check the messages above."
```

---

## Testing Checklist

- [ ] **Registration Works**
  - [ ] Seller registration (no OTP)
  - [ ] Creator registration (no OTP)
  - [ ] Login with credentials
  
- [ ] **Seller Workflow**
  - [ ] Create brand profile
  - [ ] Create campaign
  - [ ] View matched creators
  - [ ] Message creator
  - [ ] Accept collaboration

- [ ] **Creator Workflow**
  - [ ] Create creator profile
  - [ ] View campaigns
  - [ ] Receive message from seller
  - [ ] Reply to message
  - [ ] Accept offer

- [ ] **Messaging**
  - [ ] Send message
  - [ ] Receive message
  - [ ] Message history loads
  - [ ] Real-time notifications (if applicable)

- [ ] **Collaboration**
  - [ ] Status changes from PROPOSED → AGREED
  - [ ] Milestones visible
  - [ ] Payment tracking visible

---

## Troubleshooting

### "Registration endpoint not working"
- Confirm `/api/auth/register` is accessible (NOT `/register/send-otp`)
- Check password meets requirements: 8+ chars, 1 uppercase, 1 lowercase, 1 number

### "Campaign creation fails"
- Ensure brand profile exists first
- Check `promotionType` is valid: POSTS, REELS, STORIES, WEBSITE_VISIT
- Ensure `category` matches schema: FASHION, BEAUTY, LIFESTYLE, etc.

### "Can't see matched creators"
- Wait 5 seconds after campaign creation (AI matching is async)
- Check `/api/sellers/campaign/[ID]/matches` endpoint
- Ensure creators exist in system

### "Messages not sending"
- Verify `conversationId` exists
- Check user has permission to send in that conversation
- Use correct Authorization token (seller or creator making request)

### "Demo data persists after cleanup"
- Run `POST /api/demo/clean-demo-data`
- Verify all email addresses contain "demo-"
- Check Prisma migrations ran successfully

---

## Architecture Notes

**Why This Works:**
1. ✅ Auth uses direct registration (no OTP blocking)
2. ✅ Demo endpoints seed complete data in one call
3. ✅ Conversations & messages pre-populated for testing
4. ✅ JWT tokens generated so no login needed
5. ✅ All DB relations properly set up
6. ✅ Status flows ready (OPEN → ACCEPTED → COMPLETED)

**What's Different from Production:**
- Demo users can be created instantly without verification
- Email sending is skipped (caught in try-catch)
- No Brevo integration needed
- No payment processing
- Simplified matching for fast results

---

## Next Steps

1. **Start Backend Server:**
   ```bash
   cd backend
   npm install
   npm run seed  # optional: seed base data
   npm run dev
   ```

2. **Create Demo:**
   ```bash
   curl -X POST http://localhost:8080/api/demo/create-demo-users
   ```

3. **Use the Tokens:**
   - Copy token from response
   - Add to `Authorization: Bearer [TOKEN]` header
   - Test all endpoints in the workflows above

4. **Monitor Logs:**
   - Check backend console for any errors
   - Verify Prisma migrations completed
   - Ensure database connection is active

---

## Support

- Schema definitions: `/backend/prisma/schema.prisma`
- Auth middleware: `/backend/middleware/auth.js`
- Route implementations: `/backend/routes/`
- Error handling: `/backend/middleware/errorHandler.js`

Enjoy the demo! 🚀
