## 🛠️ n8n Workflow Integration

This project uses n8n for backend orchestration with two main workflows:

### 1. Product Upload Flow
- **Webhook Trigger**: Receives product image upload
- **AI Processing**: Calls LangChain extraction API
- **Database Save**: Stores product data in Supabase

### 2. Payment Callback Flow  
- **Webhook Trigger**: Receives payment notifications from Midtrans
- **Status Processing**: Updates order status in database

### Setup n8n:
1. Deploy n8n instance (n8n.cloud, Railway, or Heroku)
2. Import workflows from `n8n-workflows/restaurant-workflows.json`
3. Configure environment variables in n8n
4. Update webhook URLs in Midtrans dashboard

## 🔐 Admin Authentication

Default admin credentials:
- Email: `admin@tastevision.com`
- Password: `admin123`

**Change these in production!**

## 🌐 Deployment

### Vercel Deployment:
1. Fork this repository
2. Connect to Vercel
3. Set all environment variables
4. Deploy

### Environment Variables:
See `.env.example` for complete list
