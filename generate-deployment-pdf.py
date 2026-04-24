#!/usr/bin/env python3
"""Generate GoldGem ERP Cloud Deployment Guide PDF"""

import os, sys

# ── Palette ──
from reportlab.lib import colors
ACCENT       = colors.HexColor('#5a32d1')
TEXT_PRIMARY  = colors.HexColor('#232627')
TEXT_MUTED    = colors.HexColor('#72787e')
BG_SURFACE   = colors.HexColor('#dbe0e4')
BG_PAGE      = colors.HexColor('#eaedef')
TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = BG_SURFACE

# ── Fonts ──
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

pdfmetrics.registerFont(TTFont('DejaVuSerif', '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSerif-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Carlito', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Carlito-Bold', '/usr/share/fonts/truetype/english/Carlito-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuMono', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuMono-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf'))
registerFontFamily('DejaVuSerif', normal='DejaVuSerif', bold='DejaVuSerif-Bold')
registerFontFamily('Carlito', normal='Carlito', bold='Carlito-Bold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans-Bold')
registerFontFamily('DejaVuMono', normal='DejaVuMono', bold='DejaVuMono-Bold')

# ── Core ──
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, CondPageBreak
)
from reportlab.platypus.tableofcontents import TableOfContents
import hashlib

PAGE_W, PAGE_H = A4
LM = 1.0 * inch
RM = 1.0 * inch
TM = 0.9 * inch
BM = 0.9 * inch
AW = PAGE_W - LM - RM  # available width

# ── Styles ──
h1_style = ParagraphStyle(
    name='H1', fontName='DejaVuSerif', fontSize=20, leading=28,
    textColor=ACCENT, spaceBefore=18, spaceAfter=10, alignment=TA_LEFT
)
h2_style = ParagraphStyle(
    name='H2', fontName='DejaVuSerif', fontSize=15, leading=22,
    textColor=TEXT_PRIMARY, spaceBefore=14, spaceAfter=8, alignment=TA_LEFT
)
h3_style = ParagraphStyle(
    name='H3', fontName='DejaVuSerif', fontSize=12, leading=18,
    textColor=TEXT_PRIMARY, spaceBefore=10, spaceAfter=6, alignment=TA_LEFT
)
body = ParagraphStyle(
    name='Body', fontName='DejaVuSerif', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, spaceBefore=0, spaceAfter=6, alignment=TA_JUSTIFY
)
code_style = ParagraphStyle(
    name='Code', fontName='DejaVuMono', fontSize=9, leading=14,
    textColor=TEXT_PRIMARY, spaceBefore=4, spaceAfter=4,
    leftIndent=18, backColor=colors.HexColor('#f4f4f4'),
    borderColor=colors.HexColor('#dddddd'), borderWidth=0.5,
    borderPadding=6, alignment=TA_LEFT
)
bullet_style = ParagraphStyle(
    name='Bullet', fontName='DejaVuSerif', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, spaceBefore=2, spaceAfter=4,
    leftIndent=24, bulletIndent=12, alignment=TA_LEFT
)
note_style = ParagraphStyle(
    name='Note', fontName='DejaVuSerif', fontSize=10, leading=16,
    textColor=TEXT_MUTED, spaceBefore=6, spaceAfter=6,
    leftIndent=18, borderColor=ACCENT, borderWidth=1,
    borderPadding=8, backColor=colors.HexColor('#f5f0ff'),
    alignment=TA_LEFT
)
toc_h1 = ParagraphStyle(name='TOCH1', fontName='DejaVuSerif', fontSize=13, leftIndent=20, leading=22)
toc_h2 = ParagraphStyle(name='TOCH2', fontName='DejaVuSerif', fontSize=11, leftIndent=40, leading=18)

header_cell = ParagraphStyle(
    name='HeaderCell', fontName='DejaVuSerif', fontSize=10.5,
    textColor=colors.white, alignment=TA_CENTER, leading=15
)
data_cell = ParagraphStyle(
    name='DataCell', fontName='DejaVuSerif', fontSize=10,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, leading=14
)
data_cell_c = ParagraphStyle(
    name='DataCellC', fontName='DejaVuSerif', fontSize=10,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER, leading=14
)

# ── TocDocTemplate ──
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

def add_heading(text, style, level=0):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/>%s' % (key, text), style)
    p.bookmark_name = text
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

H1_ORPHAN = (PAGE_H - TM - BM) * 0.15

def section(text):
    return [CondPageBreak(H1_ORPHAN), add_heading(text, h1_style, level=0)]

def subsection(text):
    return [add_heading(text, h2_style, level=1)]

def subsubsection(text):
    return [add_heading(text, h3_style, level=2)]

def para(text):
    return Paragraph(text, body)

def code(text):
    return Paragraph(text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'), code_style)

def bullet(text):
    return Paragraph(text, bullet_style)

def note(text):
    return Paragraph(text, note_style)

def make_table(headers, rows, col_widths=None):
    cw = col_widths or [AW * r for r in [1.0/len(headers)] * len(headers)]
    data = [[Paragraph('<b>%s</b>' % h, header_cell) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), data_cell) if i == 0 else Paragraph(str(c), data_cell_c) for i, c in enumerate(row)])
    t = Table(data, colWidths=cw, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

# ── Build Document ──
output_path = '/home/z/my-project/download/GoldGem-ERP-Cloud-Deployment-Guide.pdf'

doc = TocDocTemplate(
    output_path, pagesize=A4,
    leftMargin=LM, rightMargin=RM, topMargin=TM, bottomMargin=BM
)

story = []

# ── TOC ──
story.append(Paragraph('<b>Table of Contents</b>', ParagraphStyle(
    name='TOCTitle', fontName='DejaVuSerif', fontSize=22, leading=30,
    textColor=ACCENT, alignment=TA_LEFT, spaceAfter=18
)))
toc = TableOfContents()
toc.levelStyles = [toc_h1, toc_h2]
story.append(toc)
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════
# SECTION 1: Overview
# ══════════════════════════════════════════════════════════════
story.extend(section('1. Overview'))
story.append(para(
    'GoldGem ERP is a comprehensive Jewellery Industry Enterprise Resource Planning system built with modern web technologies. '
    'This guide walks you through deploying the application to the cloud at zero cost using Vercel (for hosting) and Neon PostgreSQL (for the database). '
    'The entire stack is designed for free-tier cloud deployment, making it ideal for academic projects, demos, and small business prototypes.'
))
story.append(para(
    'The application consists of seven core modules: Dashboard, Manufacturing, Supply Chain Management, Inventory Management, '
    'Point of Sale (POS), E-Commerce, and AI Insights. Each module has dedicated API routes and a fully functional UI built with React, '
    'shadcn/ui, and Tailwind CSS. The backend uses Next.js API routes with Prisma ORM for database operations.'
))

story.extend(subsection('1.1 Technology Stack'))
story.append(make_table(
    ['Component', 'Technology', 'Version'],
    [
        ['Frontend Framework', 'Next.js (App Router)', '16.x'],
        ['UI Library', 'React + shadcn/ui', '19.x'],
        ['Styling', 'Tailwind CSS', '4.x'],
        ['State Management', 'Zustand + React Query', '5.x / 5.x'],
        ['Backend', 'Next.js API Routes', '16.x'],
        ['ORM', 'Prisma', '6.x'],
        ['Database', 'PostgreSQL (Neon)', 'Serverless'],
        ['Hosting', 'Vercel', 'Free Tier'],
        ['Charts', 'Recharts', '2.x'],
        ['Package Manager', 'Bun', '1.x'],
    ],
    col_widths=[AW*0.30, AW*0.42, AW*0.28]
))
story.append(Spacer(1, 6))

story.extend(subsection('1.2 Architecture Summary'))
story.append(para(
    'GoldGem ERP follows a monolithic Next.js architecture where the frontend and backend are co-located in a single application. '
    'The frontend renders React components with server-side rendering capabilities, while the backend exposes RESTful API endpoints '
    'through Next.js Route Handlers. Prisma ORM abstracts database operations and provides type-safe queries against the PostgreSQL database. '
    'This architecture is optimized for Vercel\'s serverless deployment model, where each API route becomes an independent serverless function.'
))
story.append(para(
    'The database schema comprises 17 models covering the entire jewellery ERP domain: Products, Categories, Warehouses, Inventory, '
    'Suppliers, Purchase Orders, Work Orders, Bills of Materials (BOM), Sales Orders, Customers, POS Transactions, E-Commerce Orders, '
    'Shipments, Demand Forecasts, and Audit Logs. Seed data populates the database with realistic global jewellery sample data.'
))

# ══════════════════════════════════════════════════════════════
# SECTION 2: Prerequisites
# ══════════════════════════════════════════════════════════════
story.extend(section('2. Prerequisites'))
story.append(para(
    'Before you begin the deployment process, ensure you have the following accounts and tools set up. All services listed below offer '
    'free tiers that are sufficient for deploying and running GoldGem ERP for an academic project or demonstration purposes.'
))

story.extend(subsection('2.1 Required Accounts'))
story.append(make_table(
    ['Service', 'Purpose', 'Free Tier Limits', 'URL'],
    [
        ['GitHub', 'Code repository', 'Unlimited public repos', 'github.com'],
        ['Vercel', 'App hosting', '100GB bandwidth/month', 'vercel.com'],
        ['Neon', 'PostgreSQL database', '0.5GB storage, 100 compute hrs/month', 'neon.tech'],
    ],
    col_widths=[AW*0.15, AW*0.22, AW*0.35, AW*0.28]
))
story.append(Spacer(1, 6))

story.extend(subsection('2.2 Required Tools'))
story.append(para('Install the following tools on your local machine:'))
story.append(bullet('<b>Node.js 18+</b> - JavaScript runtime (nodejs.org)'))
story.append(bullet('<b>Bun</b> - Fast JavaScript package manager (bun.sh)'))
story.append(bullet('<b>Git</b> - Version control (git-scm.com)'))
story.append(bullet('<b>Vercel CLI</b> - Install with: <font name="DejaVuSans">npm i -g vercel</font>'))
story.append(Spacer(1, 8))

# ══════════════════════════════════════════════════════════════
# SECTION 3: Step 1 - Set Up Neon PostgreSQL
# ══════════════════════════════════════════════════════════════
story.extend(section('3. Step 1: Set Up Neon PostgreSQL Database'))
story.append(para(
    'Neon is a serverless PostgreSQL platform that offers a generous free tier perfect for project deployments. '
    'Unlike traditional PostgreSQL hosting, Neon provides instant database creation, automatic scaling to zero when idle '
    '(which preserves your free compute hours), and built-in connection pooling. This makes it ideal for Vercel serverless functions.'
))

story.extend(subsection('3.1 Create a Neon Account and Project'))
story.append(para('Follow these steps to create your PostgreSQL database on Neon:'))
story.append(bullet('1. Navigate to <b>neon.tech</b> and click "Sign Up". You can sign up using your GitHub account for convenience.'))
story.append(bullet('2. After signing in, click <b>"New Project"</b> on the Neon dashboard.'))
story.append(bullet('3. Enter a project name such as <b>"goldgem-erp"</b>.'))
story.append(bullet('4. Select the region closest to your target audience. For global reach, choose <b>AWS US East (Ohio)</b> or <b>AWS EU West (Ireland)</b>. For India, select <b>AWS Asia-Pacific (Mumbai)</b>.'))
story.append(bullet('5. Click <b>"Create Project"</b>. Neon will provision your database in approximately 5-10 seconds.'))
story.append(Spacer(1, 6))

story.extend(subsection('3.2 Copy the Connection String'))
story.append(para(
    'After the project is created, Neon displays your connection string on the dashboard. It looks like this:'
))
story.append(code('postgresql://username:password@ep-xxx-xxx-123456.us-east-2.aws.neon.tech/goldgem?sslmode=require'))
story.append(para(
    'Copy this connection string and save it securely. You will need it as the <b>DATABASE_URL</b> environment variable in Vercel. '
    'Neon provides both a pooled connection string (recommended for serverless) and a direct connection string. Use the <b>pooled</b> connection string '
    '(the one with <b>-pooler</b> in the hostname) for Vercel deployments, as connection pooling is essential for serverless functions that open many short-lived connections.'
))
story.append(note(
    '<b>Important:</b> The connection string contains your database password. Never commit it to Git. Always use environment variables to store it. '
    'The .env file is already in .gitignore to prevent accidental commits.'
))

story.extend(subsection('3.3 Verify Database Connectivity'))
story.append(para('To verify your Neon database is accessible, you can use the Neon SQL Editor (available in the Neon dashboard sidebar) or connect locally:'))
story.append(code('psql "postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/goldgem?sslmode=require"'))
story.append(para('Run a simple query to confirm the connection:'))
story.append(code('SELECT version();'))
story.append(para('You should see a PostgreSQL version string, confirming the database is ready to accept connections.'))

# ══════════════════════════════════════════════════════════════
# SECTION 4: Step 2 - Push Code to GitHub
# ══════════════════════════════════════════════════════════════
story.extend(section('4. Step 2: Push Code to GitHub'))
story.append(para(
    'Vercel deploys directly from your GitHub repository. Before deploying, you need to push your GoldGem ERP code to GitHub. '
    'This section covers the complete process from initializing a Git repository to pushing to GitHub, including critical pre-deployment steps.'
))

story.extend(subsection('4.1 Switch to PostgreSQL Schema'))
story.append(para(
    'The project uses SQLite for local development by default, but production requires PostgreSQL. '
    'A PostgreSQL-ready Prisma schema is included at <b>prisma/schema.postgres.prisma</b>. You need to replace the active schema before deploying:'
))
story.append(code('cp prisma/schema.postgres.prisma prisma/schema.prisma'))
story.append(para(
    'Alternatively, you can use the provided shell script that automates this switch:'
))
story.append(code('bash switch-to-neon.sh'))
story.append(note(
    '<b>Critical:</b> This step must be done before pushing to GitHub. If you deploy with the SQLite schema, '
    'the build will fail because SQLite is not supported on Vercel\'s serverless infrastructure. The schema.postgres.prisma file '
    'is identical to schema.prisma except that the database provider is set to "postgresql" instead of "sqlite".'
))

story.extend(subsection('4.2 Verify .gitignore'))
story.append(para('Ensure your <b>.gitignore</b> file includes the following entries to prevent sensitive files from being committed:'))
story.append(code(
    'node_modules/\n'
    '.env\n'
    '.env.local\n'
    '.env.production.local\n'
    'db/\n'
    '*.db\n'
    'dev.log\n'
    'server.log\n'
    '.next/\n'
    'prisma/migrations/'
))
story.append(para('The <b>.env</b> file contains your local database URL and must never be pushed to GitHub.'))

story.extend(subsection('4.3 Create GitHub Repository and Push'))
story.append(para('Follow these steps to create a GitHub repository and push your code:'))
story.append(bullet('1. Go to <b>github.com</b> and click <b>"New Repository"</b>.'))
story.append(bullet('2. Name it <b>"goldgem-erp"</b> (or any name you prefer).'))
story.append(bullet('3. Make it <b>Public</b> (required for free Vercel deployment).'))
story.append(bullet('4. Do NOT initialize with README, .gitignore, or license (we have these already).'))
story.append(bullet('5. Click <b>"Create Repository"</b>.'))
story.append(Spacer(1, 4))
story.append(para('Then, from your project directory, run the following Git commands:'))
story.append(code(
    'git init\n'
    'git add .\n'
    'git commit -m "Initial commit: GoldGem ERP - Global Jewellery Industry ERP System"\n'
    'git branch -M main\n'
    'git remote add origin https://github.com/YOUR_USERNAME/goldgem-erp.git\n'
    'git push -u origin main'
))
story.append(note(
    '<b>Tip:</b> Replace <b>YOUR_USERNAME</b> with your actual GitHub username. If you already have a Git repository initialized, '
    'you only need to commit the schema change and push: <b>git add . && git commit -m "Switch to PostgreSQL schema" && git push</b>.'
))

# ══════════════════════════════════════════════════════════════
# SECTION 5: Step 3 - Deploy to Vercel
# ══════════════════════════════════════════════════════════════
story.extend(section('5. Step 3: Deploy to Vercel'))
story.append(para(
    'Vercel is the recommended hosting platform for Next.js applications. It provides seamless integration with GitHub, '
    'automatic deployments on every push, preview deployments for pull requests, and a generous free tier. '
    'This section walks you through the complete deployment process.'
))

story.extend(subsection('5.1 Create a Vercel Account'))
story.append(bullet('1. Go to <b>vercel.com</b> and click <b>"Sign Up"</b>.'))
story.append(bullet('2. Choose <b>"Continue with GitHub"</b> to link your GitHub account.'))
story.append(bullet('3. Authorize Vercel to access your GitHub repositories.'))
story.append(Spacer(1, 4))

story.extend(subsection('5.2 Import Your Project'))
story.append(bullet('1. From the Vercel dashboard, click <b>"Add New..."</b> then <b>"Project"</b>.'))
story.append(bullet('2. Find <b>"goldgem-erp"</b> in your repository list and click <b>"Import"</b>.'))
story.append(bullet('3. Configure the project settings on the import page.'))
story.append(Spacer(1, 4))

story.extend(subsection('5.3 Configure Build Settings'))
story.append(para('On the "Configure Project" page, set the following values:'))
story.append(make_table(
    ['Setting', 'Value', 'Notes'],
    [
        ['Framework Preset', 'Next.js', 'Auto-detected'],
        ['Build Command', 'prisma generate && next build', 'Already in vercel.json'],
        ['Install Command', 'bun install', 'Already in vercel.json'],
        ['Output Directory', '.next', 'Default'],
        ['Node.js Version', '18.x', 'Set in Vercel settings'],
    ],
    col_widths=[AW*0.25, AW*0.35, AW*0.40]
))
story.append(Spacer(1, 6))
story.append(note(
    '<b>Note:</b> The <b>vercel.json</b> file in the project root already specifies the build command and install command. '
    'Vercel will auto-detect these from the configuration file, so you typically do not need to override them manually.'
))

story.extend(subsection('5.4 Add Environment Variables'))
story.append(para(
    'This is the most critical step. You must add your Neon PostgreSQL connection string as an environment variable. '
    'On the same "Configure Project" page, expand the <b>"Environment Variables"</b> section and add:'
))
story.append(make_table(
    ['Key', 'Value', 'Environments'],
    [
        ['DATABASE_URL', 'postgresql://user:pass@ep-xxx.pooler.region.aws.neon.tech/goldgem?sslmode=require', 'Production, Preview, Development'],
    ],
    col_widths=[AW*0.20, AW*0.55, AW*0.25]
))
story.append(Spacer(1, 6))
story.append(para(
    'Paste the <b>pooled connection string</b> from the Neon dashboard as the value. The pooled connection (with "-pooler" in the hostname) '
    'is essential because Vercel serverless functions create many short-lived database connections, and Neon\'s pooler efficiently manages these.'
))
story.append(note(
    '<b>Security:</b> Make sure the "Encrypt" toggle is ON for the DATABASE_URL variable. This ensures the value is encrypted at rest '
    'and not visible in build logs or the Vercel dashboard after saving.'
))

story.extend(subsection('5.5 Deploy'))
story.append(para(
    'Click the <b>"Deploy"</b> button. Vercel will now build and deploy your application. The first deployment typically takes 2-5 minutes. '
    'You can watch the build logs in real-time on the Vercel dashboard. The build process performs these steps automatically:'
))
story.append(bullet('1. <b>Install dependencies</b> - Bun installs all npm packages including Prisma.'))
story.append(bullet('2. <b>Generate Prisma Client</b> - <b>prisma generate</b> creates the type-safe Prisma Client from your schema.'))
story.append(bullet('3. <b>Build Next.js</b> - <b>next build</b> compiles the application, optimizes assets, and creates serverless functions for each API route.'))
story.append(bullet('4. <b>Deploy</b> - Vercel deploys the built output to its global edge network.'))
story.append(Spacer(1, 4))
story.append(para(
    'Once the deployment succeeds, Vercel provides a URL like <b>goldgem-erp-xxxx.vercel.app</b>. Visit this URL to see your application. '
    'However, the database is empty at this point. The next step will seed it with sample data.'
))

# ══════════════════════════════════════════════════════════════
# SECTION 6: Step 4 - Seed the Database
# ══════════════════════════════════════════════════════════════
story.extend(section('6. Step 4: Seed the Database'))
story.append(para(
    'After deploying, your database is empty. You need to push the schema and seed it with sample data. '
    'There are two methods to accomplish this: using the Vercel CLI locally, or using the Neon SQL Editor. '
    'The Vercel CLI method is recommended because it handles the full Prisma migration and seeding workflow.'
))

story.extend(subsection('6.1 Method A: Using Vercel CLI (Recommended)'))
story.append(para('Install the Vercel CLI and link your project:'))
story.append(code('npm i -g vercel\nvercel login\nvercel link'))
story.append(para('Pull the production environment variables to your local machine:'))
story.append(code('vercel env pull .env.production.local'))
story.append(para(
    'This creates a <b>.env.production.local</b> file with the DATABASE_URL from Vercel. Now run the Prisma commands to push the schema and seed:'
))
story.append(code(
    '# Push the database schema to Neon\n'
    'npx prisma db push\n'
    '\n'
    '# Seed the database with sample data\n'
    'bun run db:seed'
))
story.append(para(
    'The seed script (<b>prisma/seed.ts</b>) populates the database with comprehensive sample data including: 3 users with different roles, '
    '8 product categories (Gold Necklaces, Diamond Rings, Silver Earrings, Platinum Bracelets, Pearl Collections, Luxury Watches, '
    'Gemstone Pendants, Bridal Collections), 22 products with realistic global jewellery data, 3 warehouses (New York, London, Dubai), '
    '25 inventory items, 5 suppliers from around the world, 6 purchase orders, 8 customers, 5 sales orders, 8 POS transactions, '
    '5 e-commerce orders, and BOM components for manufactured products.'
))
story.append(note(
    '<b>Troubleshooting:</b> If <b>prisma db push</b> fails with a connection error, verify your DATABASE_URL is correct in '
    '<b>.env.production.local</b>. Ensure you are using the pooled connection string. If <b>bun run db:seed</b> fails, try '
    '<b>npx prisma db seed</b> instead. Also check that your Neon database is not in a suspended state (Neon auto-suspends after 5 minutes of inactivity on the free tier).'
))

story.extend(subsection('6.2 Method B: Using Neon SQL Editor'))
story.append(para(
    'If you prefer not to use the Vercel CLI, you can push the schema and seed data directly through the Neon dashboard:'
))
story.append(bullet('1. Open your Neon project dashboard and click <b>"SQL Editor"</b> in the sidebar.'))
story.append(bullet('2. First, generate the SQL for your Prisma schema locally:'))
story.append(code('npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > schema.sql'))
story.append(bullet('3. Copy the contents of <b>schema.sql</b> and paste it into the Neon SQL Editor.'))
story.append(bullet('4. Click <b>"Run"</b> to create all database tables.'))
story.append(bullet('5. To seed data, use the <b>/api/seed</b> endpoint of your deployed application:'))
story.append(code('curl -X POST https://goldgem-erp-xxxx.vercel.app/api/seed'))
story.append(para(
    'This triggers the server-side seed endpoint which populates the database with sample data. The seed API route is included in the application at <b>src/app/api/seed/route.ts</b>.'
))

# ══════════════════════════════════════════════════════════════
# SECTION 7: Step 5 - Verify Deployment
# ══════════════════════════════════════════════════════════════
story.extend(section('7. Step 5: Verify Your Deployment'))
story.append(para(
    'After seeding the database, verify that your application is fully functional by testing each module. '
    'Visit your Vercel deployment URL and check the following endpoints and features:'
))

story.extend(subsection('7.1 Health Check'))
story.append(para('Test the health endpoint to confirm the application is running and the database is connected:'))
story.append(code('curl https://goldgem-erp-xxxx.vercel.app/api/health'))
story.append(para('A successful response returns JSON with status "ok" and database connection confirmation.'))

story.extend(subsection('7.2 API Endpoint Verification'))
story.append(para('Verify each API route returns data correctly:'))
story.append(make_table(
    ['Module', 'API Endpoint', 'Expected Response'],
    [
        ['Dashboard', '/api/dashboard', 'Summary statistics JSON'],
        ['Products', '/api/products', 'Array of 22 products'],
        ['Categories', '/api/categories', 'Array of 8 categories'],
        ['Inventory', '/api/inventory', 'Inventory items with stock levels'],
        ['Suppliers', '/api/suppliers', 'Array of 5 global suppliers'],
        ['Purchase Orders', '/api/purchase-orders', 'Array of 6 POs'],
        ['Work Orders', '/api/work-orders', 'Work order list'],
        ['BOM', '/api/bom', 'Bill of Materials data'],
        ['Warehouses', '/api/warehouses', '3 warehouses (NYC, London, Dubai)'],
        ['Customers', '/api/customers', 'Array of 8 customers'],
        ['Sales Orders', '/api/sales-orders', 'Sales order list'],
        ['Shipments', '/api/shipments', 'Shipment tracking data'],
        ['POS', '/api/pos', 'POS transaction history'],
        ['E-Commerce', '/api/ecommerce', 'Online order list'],
        ['AI Forecast', '/api/ai/forecast', 'Demand forecast data'],
    ],
    col_widths=[AW*0.22, AW*0.38, AW*0.40]
))
story.append(Spacer(1, 6))

story.extend(subsection('7.3 Frontend Module Verification'))
story.append(para(
    'Open the application URL in a browser and click through each of the seven modules in the sidebar navigation: '
    'Dashboard, Manufacturing, Supply Chain, Inventory, POS, E-Commerce, and AI Insights. Each module should display '
    'real data from the seeded database with interactive charts, tables, and forms. The Dashboard module shows '
    'aggregate statistics and key performance indicators across all modules.'
))

# ══════════════════════════════════════════════════════════════
# SECTION 8: Post-Deployment Configuration
# ══════════════════════════════════════════════════════════════
story.extend(section('8. Post-Deployment Configuration'))
story.append(para(
    'After successful deployment, consider these additional configuration steps to optimize your application for production use.'
))

story.extend(subsection('8.1 Custom Domain (Optional)'))
story.append(para(
    'Vercel allows you to add a custom domain to your deployment. From your Vercel project dashboard, go to '
    '<b>Settings > Domains</b> and add your custom domain. You will need to configure DNS records with your domain registrar '
    'to point to Vercel\'s servers. Vercel automatically provisions SSL certificates via Let\'s Encrypt. '
    'If you do not have a custom domain, your application is accessible at the default <b>goldgem-erp-xxxx.vercel.app</b> URL.'
))

story.extend(subsection('8.2 Environment Variables Management'))
story.append(para(
    'You can manage environment variables at any time from the Vercel dashboard under <b>Settings > Environment Variables</b>. '
    'Changes to environment variables require a redeployment to take effect. To redeploy, go to the <b>Deployments</b> tab, '
    'find the latest deployment, click the three-dot menu, and select <b>"Redeploy"</b>.'
))

story.extend(subsection('8.3 Automatic Deployments'))
story.append(para(
    'Vercel automatically deploys your application every time you push to the <b>main</b> branch on GitHub. '
    'Pull requests create <b>Preview Deployments</b> with unique URLs, allowing you to test changes before merging. '
    'This CI/CD workflow ensures your production deployment is always up to date with your latest code.'
))

story.extend(subsection('8.4 Neon Database Management'))
story.append(make_table(
    ['Task', 'How To'],
    [
        ['Reset database', 'Run: npx prisma migrate reset (locally with env pulled)'],
        ['View data', 'Use Neon SQL Editor in the dashboard'],
        ['Monitor queries', 'Neon Dashboard > Monitoring tab'],
        ['Check compute usage', 'Neon Dashboard > Home > Compute usage'],
        ['Suspend/Resume', 'Neon auto-suspends after 5 min idle on free tier'],
        ['Backup data', 'Neon free tier includes Point-in-Time Recovery (7 days)'],
    ],
    col_widths=[AW*0.30, AW*0.70]
))
story.append(Spacer(1, 6))

# ══════════════════════════════════════════════════════════════
# SECTION 9: Free Tier Limits
# ══════════════════════════════════════════════════════════════
story.extend(section('9. Free Tier Limits and Quotas'))
story.append(para(
    'Both Vercel and Neon offer generous free tiers, but it is important to understand their limits to avoid unexpected interruptions. '
    'The following tables summarize the key limitations of each service.'
))

story.extend(subsection('9.1 Vercel Free Tier'))
story.append(make_table(
    ['Resource', 'Limit', 'Impact'],
    [
        ['Bandwidth', '100 GB/month', 'Sufficient for demo/academic use'],
        ['Serverless Function Duration', '10 seconds per invocation', 'All API routes execute within this limit'],
        ['Serverless Function Invocations', 'Unlimited', 'No cap on request count'],
        ['Deployment Size', '50 MB', 'Well within our app size'],
        ['Concurrent Builds', '1 at a time', 'May queue during peak hours'],
        ['Team Members', '1 (personal account)', 'No collaboration on free tier'],
    ],
    col_widths=[AW*0.30, AW*0.25, AW*0.45]
))
story.append(Spacer(1, 6))

story.extend(subsection('9.2 Neon Free Tier'))
story.append(make_table(
    ['Resource', 'Limit', 'Impact'],
    [
        ['Storage', '0.5 GB', 'Plenty for sample data (~5 MB used)'],
        ['Compute Hours', '100 hours/month', 'Auto-suspends when idle to preserve hours'],
        ['Row Limit', 'No hard limit', 'Only storage constraint applies'],
        ['Branches', '10 branches', 'Useful for testing schema changes'],
        ['Auto-Suspend', '5 minutes of inactivity', 'Cold start ~1-2 seconds on first query'],
        ['Connections', 'Via pooler only', 'Pooled connection string required'],
    ],
    col_widths=[AW*0.30, AW*0.25, AW*0.45]
))
story.append(Spacer(1, 6))

story.append(note(
    '<b>Cold Start Note:</b> Neon auto-suspends your database after 5 minutes of inactivity on the free tier. The first request after '
    'suspension takes 1-2 seconds (cold start) as the database wakes up. Subsequent requests are fast. This is normal behavior for '
    'serverless databases and does not indicate a problem. You can upgrade to a paid plan for always-on compute if needed.'
))

# ══════════════════════════════════════════════════════════════
# SECTION 10: Troubleshooting
# ══════════════════════════════════════════════════════════════
story.extend(section('10. Troubleshooting'))
story.append(para(
    'This section covers common issues you may encounter during deployment and their solutions. '
    'Most deployment failures are caused by schema mismatches, missing environment variables, or database connection issues.'
))

story.extend(subsection('10.1 Build Failures'))
story.append(make_table(
    ['Error', 'Cause', 'Solution'],
    [
        ['"prisma generate" fails', 'SQLite schema deployed to Vercel', 'Run: cp prisma/schema.postgres.prisma prisma/schema.prisma, then push again'],
        ['TypeScript build errors', 'Type mismatch in components', 'Already handled by ignoreBuildErrors: true in next.config.ts'],
        ['"bun install" fails', 'Package resolution issue', 'Try deleting bun.lock and running bun install again'],
        ['Out of memory during build', 'Large dependency tree', 'Reduce dependencies or use Vercel build cache'],
        ['Module not found', 'Missing import or broken path', 'Check that all imports resolve correctly in the codebase'],
    ],
    col_widths=[AW*0.22, AW*0.33, AW*0.45]
))
story.append(Spacer(1, 6))

story.extend(subsection('10.2 Runtime Errors'))
story.append(make_table(
    ['Error', 'Cause', 'Solution'],
    [
        ['500 Internal Server Error', 'Database not seeded or connection failed', 'Check DATABASE_URL env var and run seed'],
        ['"P1001: Can\'t reach database server"', 'Wrong connection string or DB suspended', 'Verify Neon connection string; wait for cold start'],
        ['Empty page / no data', 'Database not seeded', 'Run: bun run db:seed or curl POST /api/seed'],
        ['CORS errors', 'Not typically an issue with Vercel', 'Check API route headers configuration'],
        ['Slow first request', 'Neon cold start', 'Normal on free tier; 1-2 second warm-up'],
    ],
    col_widths=[AW*0.22, AW*0.33, AW*0.45]
))
story.append(Spacer(1, 6))

story.extend(subsection('10.3 Common Solutions'))
story.append(para('<b>Redeploying after changes:</b>'))
story.append(code(
    '# Push changes to GitHub (triggers auto-deploy)\n'
    'git add .\n'
    'git commit -m "Fix: description of change"\n'
    'git push origin main'
))
story.append(Spacer(1, 6))
story.append(para('<b>Re-seeding the database:</b>'))
story.append(code(
    '# Pull production env vars\n'
    'vercel env pull .env.production.local\n'
    '\n'
    '# Reset and re-seed\n'
    'npx prisma migrate reset\n'
    'bun run db:seed'
))
story.append(Spacer(1, 6))
story.append(para('<b>Checking Vercel build logs:</b>'))
story.append(para(
    'Go to your Vercel dashboard, click on the project, then click on the latest deployment. '
    'The "Build Logs" section shows detailed output from each build step. Expand any failed step to see the exact error message. '
    'The "Function Logs" section shows runtime errors from your API routes.'
))

# ══════════════════════════════════════════════════════════════
# SECTION 11: Quick Reference
# ══════════════════════════════════════════════════════════════
story.extend(section('11. Quick Reference: Deployment Commands'))
story.append(para('Here is a consolidated list of all commands used during the deployment process:'))

story.extend(subsection('11.1 Pre-Deployment (Local)'))
story.append(code(
    '# Switch to PostgreSQL schema\n'
    'cp prisma/schema.postgres.prisma prisma/schema.prisma\n'
    '\n'
    '# Initialize Git repository\n'
    'git init\n'
    'git add .\n'
    'git commit -m "Initial commit: GoldGem ERP"\n'
    '\n'
    '# Push to GitHub\n'
    'git branch -M main\n'
    'git remote add origin https://github.com/YOUR_USERNAME/goldgem-erp.git\n'
    'git push -u origin main'
))
story.append(Spacer(1, 6))

story.extend(subsection('11.2 Post-Deployment (Database Setup)'))
story.append(code(
    '# Install Vercel CLI\n'
    'npm i -g vercel\n'
    'vercel login\n'
    'vercel link\n'
    '\n'
    '# Pull production environment variables\n'
    'vercel env pull .env.production.local\n'
    '\n'
    '# Push schema to Neon PostgreSQL\n'
    'npx prisma db push\n'
    '\n'
    '# Seed the database with sample data\n'
    'bun run db:seed\n'
    '\n'
    '# Verify deployment\n'
    'curl https://goldgem-erp-xxxx.vercel.app/api/health'
))
story.append(Spacer(1, 6))

story.extend(subsection('11.3 Useful Vercel CLI Commands'))
story.append(code(
    '# View deployment logs\n'
    'vercel logs\n'
    '\n'
    '# List all deployments\n'
    'vercel ls\n'
    '\n'
    '# Deploy manually (if auto-deploy fails)\n'
    'vercel --prod\n'
    '\n'
    '# Open project in browser\n'
    'vercel open\n'
    '\n'
    '# Remove a deployment\n'
    'vercel remove goldgem-erp-xxxx'
))

# ══════════════════════════════════════════════════════════════
# SECTION 12: Alternative Platforms
# ══════════════════════════════════════════════════════════════
story.extend(section('12. Alternative Cloud Platforms'))
story.append(para(
    'While Vercel + Neon is the recommended deployment stack for GoldGem ERP, you can also deploy to other platforms. '
    'The following alternatives also offer free tiers and support Next.js applications with PostgreSQL databases.'
))

story.extend(subsection('12.1 Railway'))
story.append(para(
    'Railway (railway.app) provides a simpler deployment experience with built-in PostgreSQL. It auto-detects Next.js projects '
    'and handles build configuration automatically. The free tier includes $5/month in credits, which is typically sufficient for '
    'a small project. However, Railway does not offer a permanent free tier like Vercel, and credits may run out with moderate usage. '
    'To deploy on Railway, create a new project, connect your GitHub repository, add the PostgreSQL plugin, and set the DATABASE_URL '
    'environment variable. Railway handles the rest automatically.'
))

story.extend(subsection('12.2 Render'))
story.append(para(
    'Render (render.com) offers free web services with PostgreSQL. The free tier includes 750 hours/month of runtime (enough for one '
    'always-on instance) and a free PostgreSQL database that expires after 90 days. This makes Render suitable for short-term demos but '
    'not ideal for long-running projects. To deploy on Render, create a new Web Service, connect your GitHub repo, set the build command '
    'to "prisma generate && next build", the start command to "next start", and add the DATABASE_URL environment variable from the '
    'Render PostgreSQL instance. Note that free tier services on Render spin down after 15 minutes of inactivity, causing a 30-60 second '
    'cold start on the next request.'
))

story.extend(subsection('12.3 Platform Comparison'))
story.append(make_table(
    ['Feature', 'Vercel + Neon', 'Railway', 'Render'],
    [
        ['Free Tier', 'Permanent', '$5/month credits', '750 hrs/month'],
        ['Database', 'Neon (0.5 GB)', 'Built-in PostgreSQL', 'Free DB (90-day expiry)'],
        ['Cold Start', '~1-2s (Neon)', '~1s', '~30-60s'],
        ['Custom Domain', 'Yes (free)', 'Yes (paid only)', 'Yes (free)'],
        ['Auto-Deploy', 'Yes', 'Yes', 'Yes'],
        ['Best For', 'Academic / Demo', 'Simplicity', 'Short-term Demo'],
    ],
    col_widths=[AW*0.22, AW*0.26, AW*0.26, AW*0.26]
))
story.append(Spacer(1, 6))

# ══════════════════════════════════════════════════════════════
# BUILD
# ══════════════════════════════════════════════════════════════
doc.multiBuild(story)
print(f"PDF generated: {output_path}")
