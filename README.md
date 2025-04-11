# 📚 Okoa-Sem - Student Resource Sharing Platform

![Next.js](https://img.shields.io/badge/Next.js-14.0.4-000000?logo=next.js) ![Supabase](https://img.shields.io/badge/Supabase-2.39.0-3FCF8E?logo=supabase) ![Prisma](https://img.shields.io/badge/Prisma-5.9.0-2D3748?logo=prisma) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?logo=typescript)

A zero-auth academic hub for students to share verified resources. Upload past papers & notes, download peer-approved materials, and enjoy smooth animations - all without logging in!

![Resource Cards Preview](./public/screenshots/homepage.png)

## 🌟 Features
- **📤 One-Click Uploads**
  Drag-and-drop interface with metadata tagging (year, semester, resource type)
- **🛡️ Manual Verification**
  Supabase dashboard moderation before publication
- **🎨 Dynamic Animations**
  Gradient hover effects & card entrance animations
- 🌓 **Theme Toggler**
  Smooth light/dark mode transition
- **📱 Mobile-First Design**
  Fully responsive grid layout
- **🔒 Secure Backend**
  Server-side operations with Prisma ORM

## 🛠 Tech Stack
### Frontend
![Next.js](https://img.shields.io/badge/-Next.js-000000?logo=next.js) ![React](https://img.shields.io/badge/-React-61DAFB?logo=react) ![Tailwind CSS](https://img.shields.io/badge/-Tailwind%20CSS-06B6D4?logo=tailwind-css)

### Backend
![Supabase](https://img.shields.io/badge/-Supabase-3FCF8E?logo=supabase) ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?logo=postgresql) ![Prisma](https://img.shields.io/badge/-Prisma-2D3748?logo=prisma)

### Tooling
![Vercel](https://img.shields.io/badge/-Vercel-000000?logo=vercel) ![GitHub Actions](https://img.shields.io/badge/-GitHub%20Actions-2088FF?logo=github-actions)

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x+
- pnpm 9.x+
- Supabase account

### Installation
```bash
git clone https://github.com/devalentineomonya/Okoa-Sem-NextJs-Ts-Prisma-Supabase.git
cd Okoa-Sem-NextJs-Ts-Prisma-Supabase
pnpm install
```

### Configuration
1. Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

2. Initialize database:
```bash
pnpm  prisma db push
```

3. Start development server:
```bash
pnpm run dev
```

## 🧑💻 Development

### Project Structure
```
okoa-sem/
├── app/
│   ├── upload/          # Resource upload page
│   ├── resources/       # Public download section
│   └── api/             # Secure server actions
├── components/
│   └── ResourceCard/    # Animated card component
├── lib/
│   └── supabase/        # Storage & DB client
└── prisma/
    └── schema.prisma    # Resource metadata model
```

### Key Implementation Details
- **Resource Card Animations**
  Uses Framer Motion for:
  ```tsx
  <motion.div
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    whileHover={{ background: "linear-gradient(...)" }}
  >
  ```

- **Theme Toggle**
  Context API + CSS Variables:
  ```css
  :root {
    --primary-bg: #ffffff;
    --primary-text: #000000;
  }

  [data-theme="dark"] {
    --primary-bg: #000000;
    --primary-text: #ffffff;
  }
  ```

## 🔒 Security
- **Row-Level Security**
  Supabase policies for resource moderation
- **Server-Side Validation**
  All uploads processed via Next.js API routes
- **Env Protection**
  Sensitive keys never exposed to client
- **Content Scanning**
  Manual verification prevents malware uploads

## 📸 Screenshots
| Upload Interface | Resource Cards |
|------------------|----------------|
| ![Upload Page](./public/screenshots/upload-page.png) | ![Cards](./public/screenshots/resource-cards.png) |

| Dark Mode | Mobile View |
|-----------|-------------|
| ![Dark](./public/screenshots/light-mode.png) | ![Mobile](./public/screenshots/mobile-view.png) |

## 🌐 Deployment
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdevalentineomonya%2FOkoa-Sem-NextJs-Ts-Prisma-Supabase)

**Admin Setup:**
1. Enable Supabase Storage
2. Create moderation policy in SQL:
```sql
CREATE POLICY "Manual approval" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'pending-approval');
```

## 🤝 Contributing
1. Fork the repository
2. Create feature branch: `git checkout -b feat/your-feature`
3. Follow our [Contributiion](CONTRIBUTION.md)
4. Submit PR with:
   - Component tests
   - Screen recordings for UI changes
   - Updated documentation

## 📜 License
MIT License - See [LICENSE](LICENSE) for details.

---
🔧 Missing something? [Open an issue](https://github.com/devalentineomonya/Okoa-Sem-NextJs-Ts-Prisma-Supabase/issues)
