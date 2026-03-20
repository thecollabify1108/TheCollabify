# TheCollabify Demo Platform - Quick Start 🚀

## 60-Second Setup

```bash
# 1. Start the server
cd backend
npm run dev

# 2. In another terminal, create demo environment
curl -X POST http://localhost:8080/api/demo/create-demo-users

# 3. Copy tokens from response and use them!
curl -X GET http://localhost:8080/api/sellers/profile \
  -H "Authorization: Bearer [SELLER_TOKEN]"
```

## That's It! 

You now have:
✅ Seller with full profile  
✅ 3 Creators with Instagram profiles  
✅ Campaign with AI-matched creators  
✅ Conversation with messages  
✅ Active collaboration  

## Next Steps

- **Full Guide:** See `DEMO_PLATFORM_GUIDE.md`
- **Summary:** See `DEMO_COMPLETE_SUMMARY.md`
- **Testing:** `npm test -- test-demo-workflow.test.js` (in backend)
- **Postman:** Import `TheCollabify-Demo-Postman.json`

## Key Features

🎯 **NO OTP Required** - Direct registration works  
🎯 **Complete Workflows** - Seller & Creator end-to-end  
🎯 **Pre-Populated** - All demo data created in one call  
🎯 **Real Messaging** - Full conversation system  
🎯 **Collaboration** - Complete lifecycle tracking  

## Common Commands

```bash
# Get all conversations
curl -X GET http://localhost:8080/api/chat/conversations \
  -H "Authorization: Bearer [TOKEN]"

# Send message
curl -X POST http://localhost:8080/api/chat/[CONVERSATION_ID]/message \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"content":"Hello!"}'

# Accept collaboration offer
curl -X POST http://localhost:8080/api/chat/[CONVERSATION_ID]/accept \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"agreedAmount":1500,"startDate":"2024-01-20","endDate":"2024-02-03"}'

# Clean up demo data
curl -X POST http://localhost:8080/api/demo/clean-demo-data
```

## Endpoints

**Demo Setup:**
```
POST   /api/demo/create-demo-users      Create everything in one call
GET    /api/demo/demo-users             List demo users
POST   /api/demo/clean-demo-data        Delete all demo data
```

**Authentication:**
```
POST   /api/auth/register               Register (seller or creator)
POST   /api/auth/login                  Login
GET    /api/auth/me                     Get current user
```

**Workflows:**
```
GET    /api/sellers/profile             Seller profile
GET    /api/creators/profile            Creator profile
GET    /api/sellers/campaigns           List campaigns
GET    /api/creators/campaigns          Browse campaigns
GET    /api/chat/conversations          List conversations
POST   /api/chat/message-request        Start conversation
POST   /api/chat/[ID]/message           Send message
POST   /api/chat/[ID]/accept            Accept offer
```

## Demo Data Credentials

After running `/api/demo/create-demo-users`:

| Role | Email | Password | Where |
|------|-------|----------|-------|
| Seller | Demo-seller-[timestamp]@test.com | DemoSeller@123 | Response |
| Creator 1 | Demo-creator-@sarahfashion-[ts]@test.com | DemoCreator@123 | Response |
| Creator 2 | Demo-creator-@alexlifestyle-[ts]@test.com | DemoCreator@123 | Response |
| Creator 3 | Demo-creator-@mayabeauty-[ts]@test.com | DemoCreator@123 | Response |

**Tokens included in response - no login needed!**

## Troubleshooting

**Server won't start?**
- Check `backend/.env` has `DATABASE_URL` and `JWT_SECRET`
- Run `npm install` in backend folder
- Ensure PostgreSQL is running

**Demo users not creating?**
- Check `DATABASE_URL` points to correct database
- Run Prisma migrations: `npx prisma migrate deploy`
- Check backend logs for connection errors

**Tokens not working?**
- Use exact token from demo response
- Include `Authorization: Bearer [TOKEN]` header
- Create fresh demo if copied incorrectly

## More Information

For detailed examples and workflows, see:
- `DEMO_PLATFORM_GUIDE.md` - Complete guide with curl examples
- `DEMO_COMPLETE_SUMMARY.md` - What was created, testing checklist
- `TheCollabify-Demo-Postman.json` - Import for Postman testing

## Technology Stack

- Backend: Node.js + Express
- Database: PostgreSQL + Prisma ORM
- Auth: JWT (no external providers)
- Real-time: Socket.io ready
- Testing: Jest

## What's Included

✅ 6 new demo API endpoints  
✅ Complete integration test suite  
✅ Comprehensive documentation  
✅ Postman collection (25+ requests)  
✅ Linux/Mac setup script  
✅ Clean git commit history  
✅ Pre-populated workflow data  
✅ Error handling & fallbacks  

---

**Ready to test? Run:** `curl -X POST http://localhost:8080/api/demo/create-demo-users`

🎉 Enjoy the demo!
