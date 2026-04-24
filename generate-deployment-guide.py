#!/usr/bin/env python3
"""Generate Goldgem ERP Cloud Deployment Guide PDF"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, Image, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
import os

# ━━ Color Palette ━━
ACCENT       = colors.HexColor('#217591')
TEXT_PRIMARY  = colors.HexColor('#232527')
TEXT_MUTED    = colors.HexColor('#757c82')
BG_SURFACE   = colors.HexColor('#d4d9dd')
BG_PAGE      = colors.HexColor('#e9ecee')
GOLD         = colors.HexColor('#d97706')
GOLD_LIGHT   = colors.HexColor('#fef3c7')

TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = BG_SURFACE

# ━━ Font Setup ━━
pdfmetrics.registerFont(TTFont('LiberationSerif', '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSans', '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSansMono', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('LiberationSerif', normal='LiberationSerif', bold='LiberationSerif')
registerFontFamily('LiberationSans', normal='LiberationSans', bold='LiberationSans')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

# ━━ Output ━━
OUTPUT_PATH = '/home/z/my-project/download/Goldgem-ERP-Cloud-Deployment-Guide.pdf'
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

# ━━ Styles ━━
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    'GoldTitle', fontName='LiberationSerif', fontSize=28, leading=34,
    alignment=TA_CENTER, textColor=ACCENT, spaceAfter=6,
)
subtitle_style = ParagraphStyle(
    'GoldSubtitle', fontName='LiberationSans', fontSize=14, leading=20,
    alignment=TA_CENTER, textColor=TEXT_MUTED, spaceAfter=12,
)
h1_style = ParagraphStyle(
    'GoldH1', fontName='LiberationSerif', fontSize=18, leading=24,
    textColor=ACCENT, spaceBefore=18, spaceAfter=10,
)
h2_style = ParagraphStyle(
    'GoldH2', fontName='LiberationSerif', fontSize=14, leading=20,
    textColor=TEXT_PRIMARY, spaceBefore=14, spaceAfter=8,
)
h3_style = ParagraphStyle(
    'GoldH3', fontName='LiberationSerif', fontSize=12, leading=16,
    textColor=ACCENT, spaceBefore=10, spaceAfter=6,
)
body_style = ParagraphStyle(
    'GoldBody', fontName='LiberationSerif', fontSize=10.5, leading=17,
    alignment=TA_JUSTIFY, textColor=TEXT_PRIMARY, spaceAfter=6,
    firstLineIndent=0,
)
bullet_style = ParagraphStyle(
    'GoldBullet', fontName='LiberationSerif', fontSize=10.5, leading=17,
    alignment=TA_LEFT, textColor=TEXT_PRIMARY, spaceAfter=4,
    leftIndent=20, bulletIndent=10,
)
code_style = ParagraphStyle(
    'GoldCode', fontName='DejaVuSansMono', fontSize=9, leading=14,
    alignment=TA_LEFT, textColor=colors.HexColor('#1e293b'),
    backColor=colors.HexColor('#f1f5f9'), leftIndent=16,
    rightIndent=16, spaceBefore=6, spaceAfter=6,
    borderPadding=8,
)
callout_style = ParagraphStyle(
    'GoldCallout', fontName='LiberationSerif', fontSize=10.5, leading=17,
    alignment=TA_LEFT, textColor=colors.HexColor('#92400e'),
    backColor=GOLD_LIGHT, leftIndent=16, rightIndent=16,
    spaceBefore=8, spaceAfter=8, borderPadding=10,
)
header_cell_style = ParagraphStyle(
    'HeaderCell', fontName='LiberationSerif', fontSize=10, leading=14,
    textColor=TABLE_HEADER_TEXT, alignment=TA_CENTER,
)
cell_style = ParagraphStyle(
    'TableCell', fontName='LiberationSerif', fontSize=10, leading=14,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT,
)
cell_center = ParagraphStyle(
    'TableCellC', fontName='LiberationSerif', fontSize=10, leading=14,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER,
)

# ━━ Build Document ━━
doc = SimpleDocTemplate(
    OUTPUT_PATH, pagesize=A4,
    leftMargin=1.0*inch, rightMargin=1.0*inch,
    topMargin=0.8*inch, bottomMargin=0.8*inch,
    title='Goldgem ERP Cloud Deployment Guide',
    author='Z.ai',
    subject='Step-by-step deployment guide for Goldgem ERP on Vercel + Neon PostgreSQL',
)

story = []
W = A4[0] - 2.0*inch  # available width

# ━━ COVER ━━
story.append(Spacer(1, 80))
story.append(Paragraph('<b>Goldgem ERP</b>', title_style))
story.append(Spacer(1, 8))
story.append(HRFlowable(width='60%', thickness=2, color=GOLD, spaceAfter=12, spaceBefore=4, hAlign='CENTER'))
story.append(Paragraph('Cloud Deployment Guide', ParagraphStyle(
    'CoverSub', fontName='LiberationSerif', fontSize=20, leading=26,
    alignment=TA_CENTER, textColor=TEXT_PRIMARY,
)))
story.append(Spacer(1, 16))
story.append(Paragraph('Vercel + Neon PostgreSQL', subtitle_style))
story.append(Spacer(1, 30))
story.append(Paragraph('Jewellery Industry ERP System', ParagraphStyle(
    'CoverTag', fontName='LiberationSans', fontSize=12, leading=16,
    alignment=TA_CENTER, textColor=TEXT_MUTED,
)))
story.append(Spacer(1, 6))
story.append(Paragraph('7 Modules: Dashboard, Manufacturing, Supply Chain, Inventory, POS, E-Commerce, AI Insights', ParagraphStyle(
    'CoverTag2', fontName='LiberationSans', fontSize=10, leading=14,
    alignment=TA_CENTER, textColor=TEXT_MUTED,
)))
story.append(Spacer(1, 60))
story.append(HRFlowable(width='40%', thickness=1, color=BG_SURFACE, hAlign='CENTER'))
story.append(Spacer(1, 12))
story.append(Paragraph('Amity Online MCA 4th Semester - Major Project', ParagraphStyle(
    'CoverMeta', fontName='LiberationSans', fontSize=10, leading=14,
    alignment=TA_CENTER, textColor=TEXT_MUTED,
)))
story.append(Paragraph('April 2026', ParagraphStyle(
    'CoverDate', fontName='LiberationSans', fontSize=10, leading=14,
    alignment=TA_CENTER, textColor=TEXT_MUTED,
)))

story.append(PageBreak())

# ━━ SECTION 1: WHY THIS STACK ━━
story.append(Paragraph('<b>1. Why Vercel + Neon PostgreSQL?</b>', h1_style))
story.append(Paragraph(
    'Choosing the right cloud platform is critical for a student project. You need something that is free, reliable, easy to set up, and production-ready. After evaluating multiple options (Railway, Render, Supabase, Fly.io), the <b>Vercel + Neon</b> combination emerges as the clear winner for Goldgem ERP. Vercel provides zero-configuration Next.js deployment with automatic SSL, preview deployments, and generous free tier limits. Neon offers serverless PostgreSQL with instant provisioning, branching, and a free tier that never expires. Together, they create a powerful, cost-free deployment stack that handles real traffic without any credit card requirement.',
    body_style
))

# Comparison table
comp_data = [
    [Paragraph('<b>Platform</b>', header_cell_style),
     Paragraph('<b>Free Tier</b>', header_cell_style),
     Paragraph('<b>Next.js Support</b>', header_cell_style),
     Paragraph('<b>Database</b>', header_cell_style),
     Paragraph('<b>Verdict</b>', header_cell_style)],
    [Paragraph('Vercel + Neon', cell_style), Paragraph('100GB bw + 0.5GB DB', cell_center),
     Paragraph('Native', cell_center), Paragraph('PostgreSQL', cell_center), Paragraph('Best', cell_center)],
    [Paragraph('Railway', cell_style), Paragraph('$5 credit (expires)', cell_center),
     Paragraph('Docker', cell_center), Paragraph('PostgreSQL', cell_center), Paragraph('Credit runs out', cell_center)],
    [Paragraph('Render', cell_style), Paragraph('750hrs + spins down', cell_center),
     Paragraph('Good', cell_center), Paragraph('PostgreSQL (90 days)', cell_center), Paragraph('DB expires', cell_center)],
    [Paragraph('Supabase', cell_style), Paragraph('500MB DB + Auth', cell_center),
     Paragraph('Manual config', cell_center), Paragraph('PostgreSQL', cell_center), Paragraph('Complex setup', cell_center)],
    [Paragraph('Fly.io', cell_style), Paragraph('3 shared VMs', cell_center),
     Paragraph('Docker', cell_center), Paragraph('PostgreSQL', cell_center), Paragraph('Complex CLI', cell_center)],
]
t = Table(comp_data, colWidths=[W*0.18, W*0.22, W*0.18, W*0.20, W*0.22], hAlign='CENTER')
t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0,0), (-1,0), TABLE_HEADER_TEXT),
    ('BACKGROUND', (0,1), (-1,1), GOLD_LIGHT),
    ('BACKGROUND', (0,2), (-1,2), TABLE_ROW_EVEN),
    ('BACKGROUND', (0,3), (-1,3), TABLE_ROW_ODD),
    ('BACKGROUND', (0,4), (-1,4), TABLE_ROW_EVEN),
    ('BACKGROUND', (0,5), (-1,5), TABLE_ROW_ODD),
    ('GRID', (0,0), (-1,-1), 0.5, TEXT_MUTED),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
]))
story.append(Spacer(1, 18))
story.append(t)
story.append(Spacer(1, 6))
story.append(Paragraph('<b>Table 1:</b> Cloud Platform Comparison for Goldgem ERP', ParagraphStyle(
    'Caption', fontName='LiberationSans', fontSize=9, leading=12, alignment=TA_CENTER, textColor=TEXT_MUTED)))

story.append(Spacer(1, 18))
story.append(Paragraph(
    'The key advantage of Vercel is its native Next.js support. Unlike other platforms that require Docker configuration or manual build settings, Vercel automatically detects Next.js projects, configures the build process, handles serverless functions for API routes, and provides instant previews for every git push. The free tier includes 100GB bandwidth per month, which is more than sufficient for a student project demo and even handles moderate production traffic.',
    body_style
))
story.append(Paragraph(
    'Neon PostgreSQL is the perfect database companion because it offers true serverless PostgreSQL with auto-scaling, instant connection pooling via PgBouncer (critical for serverless functions), and database branching for development. The free tier includes 0.5GB storage, which comfortably holds all 18 tables of the Goldgem ERP schema with demo data. Unlike Render (which deletes your PostgreSQL database after 90 days), Neon keeps your data permanently on the free tier.',
    body_style
))

# ━━ SECTION 2: ARCHITECTURE ━━
story.append(Spacer(1, 12))
story.append(Paragraph('<b>2. Architecture Overview</b>', h1_style))
story.append(Paragraph(
    'Goldgem ERP follows a modern full-stack architecture built on Next.js 16 with the App Router pattern. The frontend uses React 19 with TanStack Query for server state management, Zustand for client state, and shadcn/ui for the component library. The backend consists of Next.js API Routes (serverless functions on Vercel) that connect to Neon PostgreSQL through Prisma ORM. Charts are powered by Recharts, and the entire UI uses Tailwind CSS for styling with a gold/amber theme appropriate for the jewellery industry.',
    body_style
))

arch_data = [
    [Paragraph('<b>Layer</b>', header_cell_style), Paragraph('<b>Technology</b>', header_cell_style),
     Paragraph('<b>Purpose</b>', header_cell_style)],
    [Paragraph('Frontend', cell_style), Paragraph('React 19 + TanStack Query + Zustand', cell_style),
     Paragraph('Interactive SPA with 7 ERP modules', cell_style)],
    [Paragraph('UI Components', cell_style), Paragraph('shadcn/ui + Tailwind CSS 4', cell_style),
     Paragraph('Professional jewellery-themed design system', cell_style)],
    [Paragraph('API Layer', cell_style), Paragraph('Next.js 16 API Routes (App Router)', cell_style),
     Paragraph('RESTful endpoints for all CRUD operations', cell_style)],
    [Paragraph('ORM', cell_style), Paragraph('Prisma 6 with PostgreSQL provider', cell_style),
     Paragraph('Type-safe database access, migrations, seeding', cell_style)],
    [Paragraph('Database', cell_style), Paragraph('Neon Serverless PostgreSQL', cell_style),
     Paragraph('Cloud-native, connection pooling, branching', cell_style)],
    [Paragraph('Hosting', cell_style), Paragraph('Vercel (Serverless)', cell_style),
     Paragraph('Auto-scaling, edge network, zero-config deploy', cell_style)],
    [Paragraph('Charts', cell_style), Paragraph('Recharts', cell_style),
     Paragraph('Revenue, inventory, forecast visualizations', cell_style)],
]
t2 = Table(arch_data, colWidths=[W*0.18, W*0.38, W*0.44], hAlign='CENTER')
t2.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0,0), (-1,0), TABLE_HEADER_TEXT),
    ('BACKGROUND', (0,1), (-1,1), TABLE_ROW_EVEN),
    ('BACKGROUND', (0,2), (-1,2), TABLE_ROW_ODD),
    ('BACKGROUND', (0,3), (-1,3), TABLE_ROW_EVEN),
    ('BACKGROUND', (0,4), (-1,4), TABLE_ROW_ODD),
    ('BACKGROUND', (0,5), (-1,5), TABLE_ROW_EVEN),
    ('BACKGROUND', (0,6), (-1,6), TABLE_ROW_ODD),
    ('BACKGROUND', (0,7), (-1,7), TABLE_ROW_EVEN),
    ('GRID', (0,0), (-1,-1), 0.5, TEXT_MUTED),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
]))
story.append(Spacer(1, 12))
story.append(t2)
story.append(Spacer(1, 6))
story.append(Paragraph('<b>Table 2:</b> Goldgem ERP Technology Stack', ParagraphStyle(
    'Caption2', fontName='LiberationSans', fontSize=9, leading=12, alignment=TA_CENTER, textColor=TEXT_MUTED)))

# ━━ SECTION 3: STEP-BY-STEP DEPLOYMENT ━━
story.append(Spacer(1, 18))
story.append(Paragraph('<b>3. Step-by-Step Deployment</b>', h1_style))

# Step 3.1
story.append(Paragraph('<b>3.1 Create a Neon Database</b>', h2_style))
story.append(Paragraph(
    'Neon is a serverless PostgreSQL platform that provides free, instant databases with no credit card required. The setup takes under 2 minutes and gives you a production-ready PostgreSQL database with connection pooling built in. Start by navigating to neon.tech and creating an account using your GitHub credentials for the fastest sign-up experience.',
    body_style
))
steps_neon = [
    'Go to <b>https://neon.tech</b> and click "Sign Up" (use GitHub for one-click signup)',
    'Click <b>"Create Project"</b> and name it "goldgem-erp"',
    'Select the region closest to your target audience (e.g., Asia Pacific for Indian users)',
    'After creation, Neon shows your connection strings. Copy both:',
    '   - <b>DATABASE_URL</b> (pooled connection via PgBouncer - used by the app at runtime)',
    '   - <b>DIRECT_URL</b> (direct connection - used by Prisma Migrate for schema changes)',
    'Store these URLs securely. You will need them in Step 3.3.',
]
for i, step in enumerate(steps_neon, 1):
    story.append(Paragraph(f'{i}. {step}', bullet_style))

story.append(Spacer(1, 8))
story.append(Paragraph(
    'Important: Neon provides two connection strings for a reason. The pooled URL routes through PgBouncer, which manages database connections efficiently in a serverless environment where each API request may open a new connection. The direct URL bypasses PgBouncer and is required for Prisma Migrate, which uses features incompatible with connection pooling (like advisory locks and prepared transactions). Always use DATABASE_URL in your app code and DIRECT_URL only for migration commands.',
    body_style
))

# Step 3.2
story.append(Paragraph('<b>3.2 Push Project to GitHub</b>', h2_style))
story.append(Paragraph(
    'Vercel deploys directly from your GitHub repository, so you need to push the Goldgem ERP code to GitHub first. Before pushing, you must switch the Prisma schema from SQLite (used for local development) to PostgreSQL (required for Neon). The project includes a convenience script that handles this switch automatically.',
    body_style
))
story.append(Paragraph('Run the schema switch script:', callout_style))
story.append(Paragraph('bash switch-to-neon.sh', code_style))
story.append(Paragraph(
    'This script copies the PostgreSQL-compatible schema from prisma/schema.neon.prisma over the default schema.prisma file. After running it, your project is configured for PostgreSQL with the dual URL pattern (DATABASE_URL for pooled connections, DIRECT_URL for migrations) that Neon requires.',
    body_style
))
steps_git = [
    'Create a new repository on GitHub named "goldgem-erp"',
    'Initialize git and push the project:',
]
for i, step in enumerate(steps_git, 1):
    story.append(Paragraph(f'{i}. {step}', bullet_style))

story.append(Paragraph('git init<br/>git add .<br/>git commit -m "Goldgem ERP - cloud ready"<br/>git remote add origin https://github.com/YOUR_USERNAME/goldgem-erp.git<br/>git push -u origin main', code_style))

# Step 3.3
story.append(Paragraph('<b>3.3 Deploy to Vercel</b>', h2_style))
story.append(Paragraph(
    'Vercel provides the simplest deployment experience for Next.js projects. The entire process takes about 3 minutes from sign-up to live URL. Vercel automatically detects the Next.js framework, configures build settings, handles serverless function deployment for API routes, and provisions SSL certificates for your domain.',
    body_style
))
steps_vercel = [
    'Go to <b>https://vercel.com</b> and sign up with your GitHub account',
    'Click <b>"Add New Project"</b> and import your "goldgem-erp" repository',
    'Vercel auto-detects Next.js. Keep all default Framework Preset settings',
    'Expand the <b>"Environment Variables"</b> section and add two variables:',
    '   - Name: <b>DATABASE_URL</b> | Value: Your Neon pooled connection string',
    '   - Name: <b>DIRECT_URL</b> | Value: Your Neon direct connection string',
    'Click <b>"Deploy"</b> and wait 2-3 minutes for the build to complete',
    'Once deployed, Vercel gives you a live URL like: goldgem-erp.vercel.app',
]
for i, step in enumerate(steps_vercel, 1):
    story.append(Paragraph(f'{i}. {step}', bullet_style))

story.append(Spacer(1, 8))
story.append(Paragraph(
    'The build process on Vercel automatically runs "prisma generate" (configured in the postinstall script in package.json) to generate the Prisma Client, then builds the Next.js application. The first deployment may take slightly longer as Vercel caches build artifacts for subsequent deployments, making them significantly faster.',
    body_style
))

# Step 3.4
story.append(Paragraph('<b>3.4 Initialize the Database Schema</b>', h2_style))
story.append(Paragraph(
    'After the first successful deployment, your Neon database is empty. You need to create the tables by running Prisma migrations. The easiest way is to use Vercel CLI or run the migration locally with the Neon direct connection string. This step only needs to be done once.',
    body_style
))

story.append(Paragraph('Option A: Using Vercel CLI (Recommended)', h3_style))
steps_migrate = [
    'Install Vercel CLI: npm i -g vercel',
    'Link your project: vercel link (select your goldgem-erp project)',
    'Pull environment variables: vercel env pull .env.local',
    'Run Prisma migration: npx prisma migrate deploy',
]
for i, step in enumerate(steps_migrate, 1):
    story.append(Paragraph(f'{i}. {step}', bullet_style))

story.append(Paragraph('Option B: Run locally with Neon connection string', h3_style))
story.append(Paragraph(
    'Set DATABASE_URL and DIRECT_URL in your local .env file to the Neon values, then run: npx prisma migrate deploy. This applies all pending migrations to the remote Neon database. The migrate deploy command is production-safe and only applies migrations that have not yet been executed on the target database.',
    body_style
))

# Step 3.5
story.append(Paragraph('<b>3.5 Seed Demo Data</b>', h2_style))
story.append(Paragraph(
    'To populate the database with jewellery industry demo data, call the seed API endpoint. Open your browser and visit the following URL, or use curl from your terminal. The seed endpoint creates 5 users, 6 categories, 32 products, 3 warehouses, 5 suppliers, 20 customers, 50 POS transactions, 12 purchase orders, 12 work orders, 15 e-commerce orders, and 45 demand forecast records, all with realistic Indian jewellery industry data.',
    body_style
))
story.append(Paragraph('curl -X POST https://goldgem-erp.vercel.app/api/seed', code_style))
story.append(Spacer(1, 4))
story.append(Paragraph(
    'Alternatively, simply visit the application URL in your browser. The app automatically checks if the database is seeded and displays a loading indicator during the process. After seeding completes, the dashboard loads with full demo data showing revenue charts, inventory status, and all 7 ERP modules populated with realistic jewellery business data.',
    body_style
))

# ━━ SECTION 4: ENVIRONMENT VARIABLES ━━
story.append(Spacer(1, 12))
story.append(Paragraph('<b>4. Environment Variables Reference</b>', h1_style))
story.append(Paragraph(
    'Goldgem ERP requires only two environment variables for cloud deployment. Both are connection strings provided by Neon when you create your database project. These must be configured in the Vercel dashboard under Project Settings, then Environment Variables. The values should be set for all three environments: Production, Preview, and Development.',
    body_style
))

env_data = [
    [Paragraph('<b>Variable</b>', header_cell_style), Paragraph('<b>Required</b>', header_cell_style),
     Paragraph('<b>Description</b>', header_cell_style), Paragraph('<b>Example</b>', header_cell_style)],
    [Paragraph('DATABASE_URL', cell_style), Paragraph('Yes', cell_center),
     Paragraph('Pooled connection via PgBouncer (used by the app at runtime)', cell_style),
     Paragraph('postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require', cell_style)],
    [Paragraph('DIRECT_URL', cell_style), Paragraph('Yes', cell_center),
     Paragraph('Direct connection (used by Prisma Migrate for schema changes)', cell_style),
     Paragraph('postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require', cell_style)],
]
t3 = Table(env_data, colWidths=[W*0.18, W*0.10, W*0.38, W*0.34], hAlign='CENTER')
t3.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0,0), (-1,0), TABLE_HEADER_TEXT),
    ('BACKGROUND', (0,1), (-1,1), TABLE_ROW_EVEN),
    ('BACKGROUND', (0,2), (-1,2), TABLE_ROW_ODD),
    ('GRID', (0,0), (-1,-1), 0.5, TEXT_MUTED),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
]))
story.append(Spacer(1, 12))
story.append(t3)
story.append(Spacer(1, 6))
story.append(Paragraph('<b>Table 3:</b> Required Environment Variables', ParagraphStyle(
    'Caption3', fontName='LiberationSans', fontSize=9, leading=12, alignment=TA_CENTER, textColor=TEXT_MUTED)))

# ━━ SECTION 5: PROJECT STRUCTURE ━━
story.append(Spacer(1, 18))
story.append(Paragraph('<b>5. Project Structure</b>', h1_style))
story.append(Paragraph(
    'The Goldgem ERP project follows the Next.js 16 App Router convention with a clear separation of concerns. The prisma directory contains three schema files: schema.prisma (active, currently SQLite for development), schema.neon.prisma (PostgreSQL for Vercel deployment), and schema.sqlite.prisma (backup of the SQLite schema). The switch scripts handle copying the appropriate schema before deployment. All API routes are located under src/app/api/ with one route per domain entity, following RESTful conventions for GET and POST operations.',
    body_style
))

struct_data = [
    [Paragraph('<b>Directory / File</b>', header_cell_style), Paragraph('<b>Purpose</b>', header_cell_style)],
    [Paragraph('prisma/schema.prisma', cell_style), Paragraph('Active Prisma schema (SQLite or PostgreSQL)', cell_style)],
    [Paragraph('prisma/schema.neon.prisma', cell_style), Paragraph('PostgreSQL schema for Neon cloud deployment', cell_style)],
    [Paragraph('prisma/schema.sqlite.prisma', cell_style), Paragraph('SQLite schema backup for local development', cell_style)],
    [Paragraph('switch-to-neon.sh', cell_style), Paragraph('Switch schema to PostgreSQL before Vercel deploy', cell_style)],
    [Paragraph('switch-to-sqlite.sh', cell_style), Paragraph('Switch schema back to SQLite for local dev', cell_style)],
    [Paragraph('src/app/page.tsx', cell_style), Paragraph('Main SPA with all 7 ERP modules', cell_style)],
    [Paragraph('src/app/api/', cell_style), Paragraph('RESTful API routes for all modules', cell_style)],
    [Paragraph('src/lib/db.ts', cell_style), Paragraph('Prisma client singleton with dev/prod logging', cell_style)],
    [Paragraph('src/store/erp-store.ts', cell_style), Paragraph('Zustand store for active module and sidebar state', cell_style)],
    [Paragraph('vercel.json', cell_style), Paragraph('Vercel deployment configuration', cell_style)],
    [Paragraph('.env.example', cell_style), Paragraph('Template for required environment variables', cell_style)],
]
t4 = Table(struct_data, colWidths=[W*0.42, W*0.58], hAlign='CENTER')
t4.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0,0), (-1,0), TABLE_HEADER_TEXT),
    *[('BACKGROUND', (0,i), (-1,i), TABLE_ROW_EVEN if i%2==1 else TABLE_ROW_ODD) for i in range(1, 12)],
    ('GRID', (0,0), (-1,-1), 0.5, TEXT_MUTED),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
]))
story.append(Spacer(1, 12))
story.append(t4)
story.append(Spacer(1, 6))
story.append(Paragraph('<b>Table 4:</b> Key Project Files and Directories', ParagraphStyle(
    'Caption4', fontName='LiberationSans', fontSize=9, leading=12, alignment=TA_CENTER, textColor=TEXT_MUTED)))

# ━━ SECTION 6: ER MODULES ━━
story.append(Spacer(1, 18))
story.append(Paragraph('<b>6. ERP Modules Overview</b>', h1_style))
story.append(Paragraph(
    'Goldgem ERP consists of seven integrated modules, each designed for the specific workflows of the jewellery industry. The system uses Indian jewellery terminology throughout, such as "Karigarkhana" (workshop) for Manufacturing and "Vault" for secure storage. All monetary values use the Indian Rupee format with the en-IN locale. The following table provides a comprehensive overview of each module, its primary functions, and the database tables that support it.',
    body_style
))

mod_data = [
    [Paragraph('<b>Module</b>', header_cell_style), Paragraph('<b>Functions</b>', header_cell_style),
     Paragraph('<b>Key Tables</b>', header_cell_style)],
    [Paragraph('Dashboard', cell_style), Paragraph('KPIs, revenue charts, warehouse utilization, top products, recent activity', cell_style),
     Paragraph('Aggregates from all tables', cell_style)],
    [Paragraph('Inventory & Vault', cell_style), Paragraph('Product catalog, stock levels, warehouse capacity, low-stock alerts, add products', cell_style),
     Paragraph('Product, Category, Warehouse, InventoryItem, InventoryMovement', cell_style)],
    [Paragraph('Supply Chain', cell_style), Paragraph('Supplier management, purchase orders, shipment tracking (Kanban view)', cell_style),
     Paragraph('Supplier, PurchaseOrder, PurchaseOrderItem, Shipment, ShipmentItem', cell_style)],
    [Paragraph('Karigarkhana (Mfg)', cell_style), Paragraph('Work orders with progress tracking, Bill of Materials (BOM), production metrics', cell_style),
     Paragraph('WorkOrder, WorkOrderProduct, BomComponent', cell_style)],
    [Paragraph('Counter Sale (POS)', cell_style), Paragraph('Point-of-sale billing, making charges, payment methods (cash/card/UPI), receipts', cell_style),
     Paragraph('PosTransaction, PosTransactionItem', cell_style)],
    [Paragraph('Online Store', cell_style), Paragraph('E-commerce orders, payment tracking, shipping status, customer management', cell_style),
     Paragraph('EcommerceOrder, EcommerceOrderItem, Customer', cell_style)],
    [Paragraph('AI Insights', cell_style), Paragraph('Demand forecasting, inventory optimization, anomaly detection, sales trends', cell_style),
     Paragraph('DemandForecast, InventoryItem (optimization queries)', cell_style)],
]
t5 = Table(mod_data, colWidths=[W*0.20, W*0.45, W*0.35], hAlign='CENTER')
t5.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0,0), (-1,0), TABLE_HEADER_TEXT),
    *[('BACKGROUND', (0,i), (-1,i), TABLE_ROW_EVEN if i%2==1 else TABLE_ROW_ODD) for i in range(1, 8)],
    ('GRID', (0,0), (-1,-1), 0.5, TEXT_MUTED),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
]))
story.append(Spacer(1, 12))
story.append(t5)
story.append(Spacer(1, 6))
story.append(Paragraph('<b>Table 5:</b> Goldgem ERP Module Summary', ParagraphStyle(
    'Caption5', fontName='LiberationSans', fontSize=9, leading=12, alignment=TA_CENTER, textColor=TEXT_MUTED)))

# ━━ SECTION 7: DATABASE SCHEMA ━━
story.append(Spacer(1, 18))
story.append(Paragraph('<b>7. Database Schema</b>', h1_style))
story.append(Paragraph(
    'The Goldgem ERP database consists of 18 tables designed specifically for jewellery industry operations. The schema supports the complete supply chain from raw material procurement through manufacturing (Karigarkhana) to retail and online sales. Key design decisions include: (1) the Product table supports both finished jewellery and raw materials through the isManufactured boolean flag, (2) the BomComponent table uses a self-referencing pattern on Product to define assembly relationships, (3) all monetary fields use Float type for simplicity in a student project context, (4) the DemandForecast table stores AI-generated predictions from multiple models (Prophet, ARIMA, LSTM, Moving Average) for comparison and analysis.',
    body_style
))

db_data = [
    [Paragraph('<b>Table</b>', header_cell_style), Paragraph('<b>Records</b>', header_cell_style),
     Paragraph('<b>Purpose</b>', header_cell_style)],
    [Paragraph('User', cell_style), Paragraph('5', cell_center), Paragraph('System users (admin, manager, staff, cashier)', cell_style)],
    [Paragraph('Category', cell_style), Paragraph('6', cell_center), Paragraph('Gold, Diamond, Silver, Platinum, Gemstones, Raw Materials', cell_style)],
    [Paragraph('Product', cell_style), Paragraph('32', cell_center), Paragraph('Jewellery items and raw materials with SKU tracking', cell_style)],
    [Paragraph('Warehouse', cell_style), Paragraph('3', cell_center), Paragraph('Main Vault, Karigarkhana Workshop, Showroom Stock Room', cell_style)],
    [Paragraph('InventoryItem', cell_style), Paragraph('96', cell_center), Paragraph('Stock levels per product per warehouse with reorder points', cell_style)],
    [Paragraph('Supplier', cell_style), Paragraph('5', cell_center), Paragraph('MMTC-PAMP, Rajesh Exports, Surat Diamond Bureau, etc.', cell_style)],
    [Paragraph('PurchaseOrder', cell_style), Paragraph('12', cell_center), Paragraph('Procurement orders with GST calculation (3%)', cell_style)],
    [Paragraph('Shipment', cell_style), Paragraph('10', cell_center), Paragraph('Insured logistics tracking (BlueDart Secure, Gati Safe)', cell_style)],
    [Paragraph('WorkOrder', cell_style), Paragraph('12', cell_center), Paragraph('Manufacturing orders with wastage tracking (3% gold loss)', cell_style)],
    [Paragraph('BomComponent', cell_style), Paragraph('19', cell_center), Paragraph('Bill of Materials linking finished goods to raw materials', cell_style)],
    [Paragraph('Customer', cell_style), Paragraph('20', cell_center), Paragraph('Wholesale, retail, and online jewellery buyers', cell_style)],
    [Paragraph('PosTransaction', cell_style), Paragraph('50', cell_center), Paragraph('Counter sales with making charges (8%) and GST (3%)', cell_style)],
    [Paragraph('EcommerceOrder', cell_style), Paragraph('15', cell_center), Paragraph('Online orders with insured shipping', cell_style)],
    [Paragraph('DemandForecast', cell_style), Paragraph('45', cell_center), Paragraph('AI demand predictions (3 months, 3 models per product)', cell_style)],
    [Paragraph('AuditLog', cell_style), Paragraph('0', cell_center), Paragraph('System audit trail (empty in demo)', cell_style)],
]
t6 = Table(db_data, colWidths=[W*0.22, W*0.10, W*0.68], hAlign='CENTER')
t6.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0,0), (-1,0), TABLE_HEADER_TEXT),
    *[('BACKGROUND', (0,i), (-1,i), TABLE_ROW_EVEN if i%2==1 else TABLE_ROW_ODD) for i in range(1, 16)],
    ('GRID', (0,0), (-1,-1), 0.5, TEXT_MUTED),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 4),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
]))
story.append(Spacer(1, 12))
story.append(t6)
story.append(Spacer(1, 6))
story.append(Paragraph('<b>Table 6:</b> Database Tables and Demo Data Records', ParagraphStyle(
    'Caption6', fontName='LiberationSans', fontSize=9, leading=12, alignment=TA_CENTER, textColor=TEXT_MUTED)))

# ━━ SECTION 8: TROUBLESHOOTING ━━
story.append(Spacer(1, 18))
story.append(Paragraph('<b>8. Troubleshooting Common Issues</b>', h1_style))

story.append(Paragraph('<b>Issue: Build fails with "prisma generate" error</b>', h3_style))
story.append(Paragraph(
    'This typically happens when the Prisma schema references PostgreSQL features but the DATABASE_URL points to a SQLite database, or vice versa. Ensure you have run the switch-to-neon.sh script before deploying to Vercel. Verify that the schema.prisma file shows "provider = postgresql" after running the switch. Also confirm that the postinstall script in package.json includes "prisma generate" so that the Prisma Client is generated during the Vercel build process.',
    body_style
))

story.append(Paragraph('<b>Issue: "P1001: Cannot reach database server" error</b>', h3_style))
story.append(Paragraph(
    'This indicates that the Neon database is unreachable, which is almost always caused by incorrect environment variables. Double-check that DATABASE_URL and DIRECT_URL are set correctly in the Vercel dashboard under Settings, then Environment Variables. Ensure the URLs include ?sslmode=require at the end, as Neon requires SSL for all connections. After updating environment variables, you must trigger a new deployment for the changes to take effect.',
    body_style
))

story.append(Paragraph('<b>Issue: API routes return 500 errors after deployment</b>', h3_style))
story.append(Paragraph(
    'If the homepage loads but API routes fail, the database schema may not have been applied. Run "npx prisma migrate deploy" with the Neon direct URL to create all tables. You can also check the Vercel deployment logs under Deployments, then click on the latest deployment and scroll to the build output. The logs will show whether prisma generate succeeded and whether the build completed without errors.',
    body_style
))

story.append(Paragraph('<b>Issue: npm naming restriction "name can no longer contain capital letters"</b>', h3_style))
story.append(Paragraph(
    'This error occurs when the package.json "name" field contains uppercase letters, which violates npm naming conventions. The fix is simple: change "name": "Goldgem-ERP" to "name": "goldgem-erp" in package.json. The current project already uses the lowercase name, so this issue has been resolved. If you fork or copy the project, ensure the name field remains lowercase.',
    body_style
))

# ━━ SECTION 9: LOCAL DEVELOPMENT ━━
story.append(Spacer(1, 18))
story.append(Paragraph('<b>9. Local Development Setup</b>', h1_style))
story.append(Paragraph(
    'For local development, Goldgem ERP uses SQLite which requires no database server setup. This is ideal for development and testing on your laptop. The project includes both SQLite and PostgreSQL schemas, and you can switch between them using the provided shell scripts. The following steps get you running locally in under 5 minutes, with all demo data automatically loaded when you first open the application in your browser.',
    body_style
))
steps_local = [
    'Clone the repository: git clone https://github.com/YOUR_USERNAME/goldgem-erp.git',
    'Install dependencies: npm install (or bun install)',
    'Ensure schema.prisma uses SQLite (default): provider = "sqlite"',
    'Push the schema: npx prisma db push',
    'Start development server: npm run dev',
    'Open http://localhost:3000 in your browser',
    'The app auto-seeds demo data on first visit',
]
for i, step in enumerate(steps_local, 1):
    story.append(Paragraph(f'{i}. {step}', bullet_style))

story.append(Spacer(1, 12))
story.append(Paragraph(
    'When switching between local development (SQLite) and cloud deployment (PostgreSQL), use the convenience scripts: run "bash switch-to-sqlite.sh" for local development and "bash switch-to-neon.sh" before deploying to Vercel. These scripts handle the schema file swap automatically. Remember to run "npx prisma db push" after switching schemas locally to recreate the SQLite database with the correct schema format.',
    body_style
))

# ━━ SECTION 10: COST ANALYSIS ━━
story.append(Spacer(1, 18))
story.append(Paragraph('<b>10. Cost Analysis: Free Tier Limits</b>', h1_style))
story.append(Paragraph(
    'One of the most important considerations for a student project is cost. Both Vercel and Neon offer generous free tiers that are more than sufficient for a major project demonstration and even light production use. The following table details the exact free tier limits, what happens when you exceed them, and realistic usage estimates for the Goldgem ERP demo. As long as you stay within the free tier boundaries, your total cost is exactly zero rupees per month, making this the most budget-friendly deployment option available.',
    body_style
))

cost_data = [
    [Paragraph('<b>Service</b>', header_cell_style), Paragraph('<b>Free Tier Limit</b>', header_cell_style),
     Paragraph('<b>Goldgem Usage</b>', header_cell_style), Paragraph('<b>Exceeds?</b>', header_cell_style)],
    [Paragraph('Vercel Bandwidth', cell_style), Paragraph('100 GB/month', cell_center),
     Paragraph('~2 GB/month (demo)', cell_center), Paragraph('No', cell_center)],
    [Paragraph('Vercel Serverless Executions', cell_style), Paragraph('Unlimited', cell_center),
     Paragraph('~5,000/month', cell_center), Paragraph('No', cell_center)],
    [Paragraph('Vercel Build Time', cell_style), Paragraph('6,000 min/month', cell_center),
     Paragraph('~15 min/deploy', cell_center), Paragraph('No', cell_center)],
    [Paragraph('Neon Storage', cell_style), Paragraph('0.5 GB', cell_center),
     Paragraph('~5 MB (demo data)', cell_center), Paragraph('No', cell_center)],
    [Paragraph('Neon Compute', cell_style), Paragraph('Always-on (0.25 vCPU)', cell_center),
     Paragraph('Minimal', cell_center), Paragraph('No', cell_center)],
    [Paragraph('Neon Branches', cell_style), Paragraph('10 branches', cell_center),
     Paragraph('1 (main)', cell_center), Paragraph('No', cell_center)],
]
t7 = Table(cost_data, colWidths=[W*0.24, W*0.26, W*0.28, W*0.12], hAlign='CENTER')
t7.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0,0), (-1,0), TABLE_HEADER_TEXT),
    *[('BACKGROUND', (0,i), (-1,i), TABLE_ROW_EVEN if i%2==1 else TABLE_ROW_ODD) for i in range(1, 7)],
    ('GRID', (0,0), (-1,-1), 0.5, TEXT_MUTED),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
]))
story.append(Spacer(1, 12))
story.append(t7)
story.append(Spacer(1, 6))
story.append(Paragraph('<b>Table 7:</b> Free Tier Limits vs. Estimated Goldgem ERP Usage', ParagraphStyle(
    'Caption7', fontName='LiberationSans', fontSize=9, leading=12, alignment=TA_CENTER, textColor=TEXT_MUTED)))

# ━━ BUILD ━━
doc.build(story)
print(f'PDF generated: {OUTPUT_PATH}')
print(f'Size: {os.path.getsize(OUTPUT_PATH) / 1024:.1f} KB')
