#!/usr/bin/env python3
"""Generate GoldGem ERP Cloud Deployment Guide PDF"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, Image
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ── Font Registration ──
pdfmetrics.registerFont(TTFont('LiberationSerif', '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSerif-Bold', '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Carlito', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Carlito-Bold', '/usr/share/fonts/truetype/english/Carlito-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSansBold', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf'))
registerFontFamily('LiberationSerif', normal='LiberationSerif', bold='LiberationSerif-Bold')
registerFontFamily('Carlito', normal='Carlito', bold='Carlito-Bold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSansBold')

# ── Palette ──
ACCENT       = colors.HexColor('#1a7897')
TEXT_PRIMARY  = colors.HexColor('#21201e')
TEXT_MUTED    = colors.HexColor('#807c74')
BG_SURFACE   = colors.HexColor('#e4e1d9')
BG_PAGE      = colors.HexColor('#f3f3f0')
TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = BG_SURFACE

# ── Styles ──
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    'CustomTitle', fontName='LiberationSerif', fontSize=28,
    leading=34, alignment=TA_CENTER, textColor=ACCENT,
    spaceAfter=6
)
subtitle_style = ParagraphStyle(
    'CustomSubtitle', fontName='LiberationSerif', fontSize=14,
    leading=20, alignment=TA_CENTER, textColor=TEXT_MUTED,
    spaceAfter=24
)
h1_style = ParagraphStyle(
    'H1', fontName='LiberationSerif', fontSize=20,
    leading=26, textColor=ACCENT, spaceBefore=24, spaceAfter=12
)
h2_style = ParagraphStyle(
    'H2', fontName='LiberationSerif', fontSize=15,
    leading=20, textColor=TEXT_PRIMARY, spaceBefore=18, spaceAfter=8
)
h3_style = ParagraphStyle(
    'H3', fontName='LiberationSerif', fontSize=12,
    leading=16, textColor=TEXT_PRIMARY, spaceBefore=12, spaceAfter=6
)
body_style = ParagraphStyle(
    'Body', fontName='LiberationSerif', fontSize=10.5,
    leading=17, alignment=TA_JUSTIFY, textColor=TEXT_PRIMARY,
    spaceAfter=8
)
code_style = ParagraphStyle(
    'Code', fontName='DejaVuSans', fontSize=8.5,
    leading=13, textColor=colors.HexColor('#1a1a2e'),
    backColor=colors.HexColor('#f0f0ed'),
    leftIndent=12, rightIndent=12,
    spaceBefore=6, spaceAfter=6, borderPadding=6
)
bullet_style = ParagraphStyle(
    'Bullet', fontName='LiberationSerif', fontSize=10.5,
    leading=17, textColor=TEXT_PRIMARY, leftIndent=24,
    bulletIndent=12, spaceAfter=4
)
note_style = ParagraphStyle(
    'Note', fontName='LiberationSerif', fontSize=9.5,
    leading=15, textColor=ACCENT, leftIndent=18,
    borderPadding=8, spaceBefore=6, spaceAfter=6
)
step_style = ParagraphStyle(
    'Step', fontName='LiberationSerif', fontSize=10.5,
    leading=17, textColor=TEXT_PRIMARY, leftIndent=30,
    spaceAfter=6
)
header_cell_style = ParagraphStyle(
    'HeaderCell', fontName='LiberationSerif', fontSize=10,
    leading=14, textColor=TABLE_HEADER_TEXT, alignment=TA_CENTER
)
cell_style = ParagraphStyle(
    'Cell', fontName='LiberationSerif', fontSize=9.5,
    leading=14, textColor=TEXT_PRIMARY, alignment=TA_LEFT
)
cell_center_style = ParagraphStyle(
    'CellCenter', fontName='LiberationSerif', fontSize=9.5,
    leading=14, textColor=TEXT_PRIMARY, alignment=TA_CENTER
)

# ── Helper ──
def make_table(data_rows, col_widths):
    t = Table(data_rows, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
    ]
    for i in range(1, len(data_rows)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

def step_num(num, text):
    return Paragraph(f'<b>Step {num}:</b> {text}', step_style)

def note_box(text):
    return Paragraph(f'<b>Note:</b> {text}', note_style)

# ── Document ──
output_path = '/home/z/my-project/download/GoldGem_ERP_Deployment_Guide.pdf'
os.makedirs(os.path.dirname(output_path), exist_ok=True)

doc = SimpleDocTemplate(
    output_path,
    pagesize=A4,
    topMargin=0.8*inch,
    bottomMargin=0.8*inch,
    leftMargin=0.9*inch,
    rightMargin=0.9*inch,
    title='GoldGem ERP - Cloud Deployment Guide',
    author='Z.ai',
    creator='Z.ai'
)

story = []
page_w = A4[0] - 0.9*inch*2

# ──────────── COVER ────────────
story.append(Spacer(1, 100))
story.append(Paragraph('<b>GoldGem ERP</b>', title_style))
story.append(Spacer(1, 8))
story.append(Paragraph('Cloud Deployment Guide', ParagraphStyle(
    'CoverSub', fontName='LiberationSerif', fontSize=18,
    leading=24, alignment=TA_CENTER, textColor=TEXT_PRIMARY
)))
story.append(Spacer(1, 30))
story.append(Paragraph('Deploy to Vercel + Neon PostgreSQL (Free Tier)', subtitle_style))
story.append(Spacer(1, 60))
story.append(Paragraph('A complete step-by-step guide to deploy your GoldGem ERP Jewellery Management System to the cloud using entirely free services. This guide covers setting up a Neon PostgreSQL database, configuring environment variables, running Prisma migrations, and deploying to Vercel with automatic builds.', body_style))
story.append(Spacer(1, 30))
story.append(Paragraph('Tech Stack: Next.js 16 + Prisma ORM + PostgreSQL (Neon) + Tailwind CSS + shadcn/ui', ParagraphStyle(
    'Stack', fontName='LiberationSerif', fontSize=10,
    leading=16, alignment=TA_CENTER, textColor=TEXT_MUTED
)))
story.append(Spacer(1, 10))
story.append(Paragraph('Amity Online MCA 4th Semester Major Project', ParagraphStyle(
    'Project', fontName='LiberationSerif', fontSize=10,
    leading=16, alignment=TA_CENTER, textColor=TEXT_MUTED
)))

story.append(PageBreak())

# ──────────── TABLE OF CONTENTS ────────────
story.append(Paragraph('<b>Table of Contents</b>', h1_style))
story.append(Spacer(1, 12))
toc_items = [
    ('1', 'Overview: What You Will Deploy'),
    ('2', 'Prerequisites: Accounts You Need'),
    ('3', 'Step 1: Download Your Project'),
    ('4', 'Step 2: Set Up Neon PostgreSQL Database'),
    ('5', 'Step 3: Push Code to GitHub'),
    ('6', 'Step 4: Deploy to Vercel'),
    ('7', 'Step 5: Run Database Migrations'),
    ('8', 'Step 6: Seed Your Database'),
    ('9', 'Step 7: Verify Deployment'),
    ('10', 'Environment Variables Reference'),
    ('11', 'Troubleshooting Common Issues'),
    ('12', 'Free Tier Limits & Tips'),
]
for num, title in toc_items:
    story.append(Paragraph(f'{num}.  {title}', ParagraphStyle(
        f'TOC{num}', fontName='LiberationSerif', fontSize=11,
        leading=18, textColor=TEXT_PRIMARY, leftIndent=20, spaceAfter=4
    )))

story.append(PageBreak())

# ──────────── SECTION 1: OVERVIEW ────────────
story.append(Paragraph('<b>1. Overview: What You Will Deploy</b>', h1_style))
story.append(Paragraph('GoldGem ERP is a full-stack Jewellery Industry Enterprise Resource Planning system built as a modern web application. It features seven integrated modules: a real-time Dashboard with KPIs and charts, Manufacturing with work orders and Bill of Materials (BOM), Supply Chain Management for purchase orders and shipments, Inventory Management with multi-warehouse tracking, a Point-of-Sale (POS) system, an E-Commerce order management module, and an AI Insights dashboard with demand forecasting. The application uses Next.js 16 for the frontend and API routes, Prisma ORM for database operations, and PostgreSQL as the production database.', body_style))
story.append(Paragraph('When deployed to the cloud, your application will run on Vercel\'s serverless infrastructure, which automatically handles scaling, SSL certificates, and global CDN distribution. Your database will be hosted on Neon PostgreSQL, a serverless Postgres platform that provides a free tier with 0.5 GB of storage, which is more than sufficient for a project demonstration. The entire deployment costs nothing and can be completed in under 30 minutes if you follow these steps carefully.', body_style))
story.append(Paragraph('The deployment architecture is straightforward: your Next.js application runs on Vercel edge functions, API routes connect to the Neon PostgreSQL database using Prisma Client, and the Prisma schema has been pre-configured for PostgreSQL compatibility. The build process automatically runs <font name="DejaVuSans" size="8.5">prisma generate</font> to create the Prisma Client before the Next.js build, ensuring all database operations work correctly in the serverless environment.', body_style))

# Architecture table
story.append(Spacer(1, 12))
arch_data = [
    [Paragraph('<b>Component</b>', header_cell_style), Paragraph('<b>Service</b>', header_cell_style), Paragraph('<b>Plan</b>', header_cell_style), Paragraph('<b>Purpose</b>', header_cell_style)],
    [Paragraph('Frontend + API', cell_style), Paragraph('Vercel', cell_center_style), Paragraph('Hobby (Free)', cell_center_style), Paragraph('Host Next.js app', cell_style)],
    [Paragraph('Database', cell_style), Paragraph('Neon PostgreSQL', cell_center_style), Paragraph('Free Tier', cell_center_style), Paragraph('Store all ERP data', cell_style)],
    [Paragraph('Version Control', cell_style), Paragraph('GitHub', cell_center_style), Paragraph('Free', cell_center_style), Paragraph('Source code repository', cell_style)],
]
story.append(make_table(arch_data, [page_w*0.2, page_w*0.22, page_w*0.18, page_w*0.4]))

# ──────────── SECTION 2: PREREQUISITES ────────────
story.append(Paragraph('<b>2. Prerequisites: Accounts You Need</b>', h1_style))
story.append(Paragraph('Before you begin the deployment process, you need to create three free accounts. Each of these services offers a generous free tier that is more than enough for hosting your GoldGem ERP project. The entire process requires no credit card and no payment information. Make sure you have access to the email addresses associated with these accounts, as you will need to verify them during setup.', body_style))

prereq_data = [
    [Paragraph('<b>Service</b>', header_cell_style), Paragraph('<b>URL</b>', header_cell_style), Paragraph('<b>What You Get (Free)</b>', header_cell_style)],
    [Paragraph('GitHub', cell_style), Paragraph('github.com', cell_center_style), Paragraph('Unlimited public repos, Actions CI/CD', cell_style)],
    [Paragraph('Vercel', cell_style), Paragraph('vercel.com', cell_center_style), Paragraph('100 GB bandwidth/month, serverless functions, auto SSL', cell_style)],
    [Paragraph('Neon', cell_style), Paragraph('neon.tech', cell_center_style), Paragraph('0.5 GB storage, 100 compute hours/month, branch support', cell_style)],
]
story.append(Spacer(1, 8))
story.append(make_table(prereq_data, [page_w*0.15, page_w*0.2, page_w*0.65]))
story.append(Spacer(1, 8))
story.append(note_box('You do NOT need a credit card for any of these services. The free tiers are permanent, not trials.'))
story.append(Spacer(1, 6))
story.append(note_box('You also need Node.js 18+ installed on your computer. Download from nodejs.org if you do not have it already.'))

# ──────────── SECTION 3: DOWNLOAD PROJECT ────────────
story.append(Paragraph('<b>3. Step 1: Download Your Project</b>', h1_style))
story.append(Paragraph('Your GoldGem ERP project is located at <font name="DejaVuSans" size="8.5">/home/z/my-project/</font>. You need to download this entire project folder to your local computer. There are several ways to do this depending on your setup. The easiest method is to create a ZIP archive of the project and download it, but you can also use Git to clone the repository if it has been initialized.', body_style))

story.append(Paragraph('<b>Option A: Download as ZIP (Recommended)</b>', h2_style))
story.append(Paragraph('If you are using this project on a remote server or cloud development environment, the simplest way to get the code is to create a compressed ZIP archive and then download it through the file browser or a download link. This method preserves the entire project structure including all configuration files, the Prisma schema, seed data, and all source code modules. Make sure to exclude the <font name="DejaVuSans" size="8.5">node_modules</font> folder and the <font name="DejaVuSans" size="8.5">.next</font> build folder from the ZIP, as these are very large and will be regenerated automatically when you run npm install and npm build.', body_style))

story.append(Paragraph('Run this command in the project terminal to create a clean ZIP:', body_style))
story.append(Paragraph('zip -r goldgem-erp.zip . -x "node_modules/*" -x ".next/*" -x "db/*" -x "*.log"', code_style))
story.append(Spacer(1, 4))
story.append(Paragraph('After the ZIP is created, download it from the file manager or using the download link provided by your development environment. Once downloaded to your computer, extract it to a folder like <font name="DejaVuSans" size="8.5">C:\\Projects\\goldgem-erp</font> (Windows) or <font name="DejaVuSans" size="8.5">~/Projects/goldgem-erp</font> (Mac/Linux).', body_style))

story.append(Paragraph('<b>Option B: Initialize Git and Clone</b>', h2_style))
story.append(Paragraph('If the project has Git initialized, you can push it directly to GitHub from the development environment and then clone it to your local machine. This is the cleaner approach and sets up version control at the same time. Navigate to the project directory and run the following commands to initialize Git, add all files, commit, and push to your new GitHub repository:', body_style))
story.append(Paragraph('git init<br/>git add .<br/>git commit -m "Initial commit: GoldGem ERP"<br/>git remote add origin https://github.com/YOUR_USERNAME/goldgem-erp.git<br/>git branch -M main<br/>git push -u origin main', code_style))

# ──────────── SECTION 4: NEON POSTGRESQL ────────────
story.append(Paragraph('<b>4. Step 2: Set Up Neon PostgreSQL Database</b>', h1_style))
story.append(Paragraph('Neon is a serverless PostgreSQL platform that provides a free tier perfect for project deployments. Unlike traditional databases that run on a single server, Neon separates storage from compute, allowing your database to scale to zero when not in use and wake up instantly when queried. This means you never waste compute resources and your free tier allowance lasts much longer. The setup process takes approximately 3-5 minutes.', body_style))

story.append(step_num(1, 'Go to <font name="DejaVuSans" size="8.5">neon.tech</font> and click "Sign Up". You can sign up with your GitHub account, Google account, or email. Using your GitHub account is recommended because it simplifies the connection process later.'))
story.append(step_num(2, 'After signing in, click "Create Project" on the Neon dashboard. Enter a project name like <font name="DejaVuSans" size="8.5">goldgem-erp</font>. Select the region closest to your target audience (for example, "AWS US East (Ohio)" for North America or "AWS EU West (Frankfurt)" for Europe). Leave the Postgres version at the default (17). Click "Create Project".'))
story.append(step_num(3, 'Neon will create your database in about 10-15 seconds. Once complete, you will see a connection string displayed on the dashboard. It looks like this:'))
story.append(Paragraph('postgresql://neondb_owner:AbCdEfGh12345@ep-cool-name-12345678.us-east-2.aws.neon.tech/neondb?sslmode=require', code_style))
story.append(step_num(4, 'Copy this entire connection string. This is your <font name="DejaVuSans" size="8.5">DATABASE_URL</font> environment variable. You will need it in Steps 4 and 5. Keep it secure and do not share it publicly.'))
story.append(Spacer(1, 6))
story.append(note_box('The connection string includes ?sslmode=require which is mandatory for Neon. Never remove this parameter or the connection will fail.'))

# ──────────── SECTION 5: PUSH TO GITHUB ────────────
story.append(Paragraph('<b>5. Step 3: Push Code to GitHub</b>', h1_style))
story.append(Paragraph('Vercel deploys directly from your GitHub repository. Before connecting Vercel, you need to ensure your code is pushed to GitHub. If you followed Option B in Step 1, your code is already on GitHub and you can skip to Step 4. If you downloaded the ZIP, follow the instructions below to create a GitHub repository and push your code.', body_style))

story.append(step_num(1, 'Open your web browser and go to <font name="DejaVuSans" size="8.5">github.com/new</font> to create a new repository. Name it <font name="DejaVuSans" size="8.5">goldgem-erp</font>. Set it to Public (required for free Vercel deployment). Do NOT initialize with a README, .gitignore, or license (since the project already has these files). Click "Create Repository".'))
story.append(step_num(2, 'Open a terminal/command prompt on your computer and navigate to the extracted project folder:'))
story.append(Paragraph('cd /path/to/goldgem-erp', code_style))
story.append(step_num(3, 'Initialize Git and push to GitHub:'))
story.append(Paragraph('git init<br/>git add .<br/>git commit -m "Initial commit: GoldGem ERP"<br/>git remote add origin https://github.com/YOUR_USERNAME/goldgem-erp.git<br/>git branch -M main<br/>git push -u origin main', code_style))
story.append(Spacer(1, 6))
story.append(note_box('Make sure the .gitignore file includes node_modules, .next, .env, and *.log files. The project should already have a proper .gitignore.'))

# ──────────── SECTION 6: DEPLOY TO VERCEL ────────────
story.append(Paragraph('<b>6. Step 4: Deploy to Vercel</b>', h1_style))
story.append(Paragraph('Vercel is the platform created by the team behind Next.js, and it provides the best deployment experience for Next.js applications. When you connect your GitHub repository, Vercel automatically detects that it is a Next.js project, configures the build settings, and deploys your application. Every time you push changes to GitHub, Vercel automatically rebuilds and redeploys your application. The entire initial deployment takes about 2-5 minutes.', body_style))

story.append(step_num(1, 'Go to <font name="DejaVuSans" size="8.5">vercel.com</font> and click "Sign Up". Sign up using your GitHub account (this is strongly recommended because it allows Vercel to access your repositories directly).'))
story.append(step_num(2, 'After signing in, you will see the Vercel dashboard. Click "Add New..." then "Project". You will see a list of your GitHub repositories. Find <font name="DejaVuSans" size="8.5">goldgem-erp</font> and click "Import".'))
story.append(step_num(3, 'On the "Configure Project" page, you need to add the DATABASE_URL environment variable before deploying. This is critical because without it, the build will fail when Prisma tries to connect to the database. Scroll down to the "Environment Variables" section and add:'))

env_data = [
    [Paragraph('<b>Key</b>', header_cell_style), Paragraph('<b>Value</b>', header_cell_style)],
    [Paragraph('DATABASE_URL', cell_style), Paragraph('postgresql://neondb_owner:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require', cell_style)],
]
story.append(Spacer(1, 6))
story.append(make_table(env_data, [page_w*0.25, page_w*0.75]))
story.append(Spacer(1, 6))

story.append(step_num(4, 'Leave all other settings at their defaults. Vercel will automatically detect the Next.js framework, set the build command to <font name="DejaVuSans" size="8.5">prisma generate && next build</font>, and configure the output directory. Click "Deploy".'))
story.append(step_num(5, 'Vercel will now build your project. This takes 2-5 minutes for the first build. You can watch the build logs in real time. If the build succeeds, you will see a "Congratulations!" screen with your deployment URL (something like <font name="DejaVuSans" size="8.5">goldgem-erp-abc123.vercel.app</font>).'))
story.append(Spacer(1, 6))
story.append(note_box('If the build fails, check the error logs. The most common issue is a missing or incorrect DATABASE_URL. Make sure the connection string is correct and includes ?sslmode=require.'))

# ──────────── SECTION 7: MIGRATIONS ────────────
story.append(Paragraph('<b>7. Step 5: Run Database Migrations</b>', h1_style))
story.append(Paragraph('After the first successful deployment, your Vercel application is running but the database is empty. You need to create the database tables by running Prisma migrations. Since Vercel is a serverless platform, you cannot run commands directly on the server. Instead, you run migrations from your local computer, targeting the Neon PostgreSQL database. This is safe because Prisma migrations are designed to be run from any machine as long as they can connect to the database.', body_style))

story.append(step_num(1, 'On your local computer, navigate to the project folder in your terminal:'))
story.append(Paragraph('cd /path/to/goldgem-erp', code_style))

story.append(step_num(2, 'Install the project dependencies (if you have not already):'))
story.append(Paragraph('npm install', code_style))

story.append(step_num(3, 'Create or update the <font name="DejaVuSans" size="8.5">.env</font> file in the project root with your Neon DATABASE_URL:'))
story.append(Paragraph('DATABASE_URL="postgresql://neondb_owner:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"', code_style))

story.append(step_num(4, 'Run Prisma db push to create all tables in the Neon database:'))
story.append(Paragraph('npx prisma db push', code_style))
story.append(Paragraph('This command reads your Prisma schema and creates all the tables (User, Product, Warehouse, Supplier, etc.) in your Neon PostgreSQL database. You should see output confirming that the tables were created successfully. The <font name="DejaVuSans" size="8.5">prisma db push</font> command is preferred over <font name="DejaVuSans" size="8.5">prisma migrate dev</font> for initial setup because it does not require a migration history folder.', body_style))
story.append(Spacer(1, 6))
story.append(note_box('Make sure your local .env DATABASE_URL matches the one you set in Vercel. Both should point to the same Neon database.'))

# ──────────── SECTION 8: SEED ────────────
story.append(Paragraph('<b>8. Step 6: Seed Your Database</b>', h1_style))
story.append(Paragraph('Your database now has all the tables but no data. The seed script will populate it with realistic sample data including products (gold chains, diamond rings, silver earrings, platinum bracelets, pearl collections, luxury watches, gemstone pendants, and bridal collections), warehouses in New York, London, and Dubai, suppliers from Switzerland, Belgium, Italy, Tahiti, and Colombia, purchase orders, sales orders, POS transactions, e-commerce orders, and AI demand forecasts. This gives your deployed application a complete, professional-looking demo.', body_style))

story.append(step_num(1, 'From your local terminal (in the project folder with .env configured), run the seed command:'))
story.append(Paragraph('npx prisma db seed', code_style))

story.append(step_num(2, 'Wait for the seeding to complete. You should see console output like "Seeding GoldGem ERP database..." followed by "Creating categories...", "Creating products...", etc. The entire seeding process takes about 10-30 seconds depending on your internet connection speed to the Neon database.'))

story.append(step_num(3, 'To verify the data was seeded correctly, you can check using Prisma Studio:'))
story.append(Paragraph('npx prisma studio', code_style))
story.append(Paragraph('This opens a web-based database browser at <font name="DejaVuSans" size="8.5">http://localhost:5555</font> where you can view all the tables and data. You should see 22 products, 3 warehouses, 5 suppliers, 8 customers, 6 purchase orders, 5 sales orders, 8 POS transactions, and 5 e-commerce orders. Close Prisma Studio when done by pressing Ctrl+C in the terminal.', body_style))

# ──────────── SECTION 9: VERIFY ────────────
story.append(Paragraph('<b>9. Step 7: Verify Deployment</b>', h1_style))
story.append(Paragraph('Now that your application is deployed and the database is seeded, it is time to verify everything is working correctly. Open your web browser and navigate to the Vercel deployment URL (e.g., <font name="DejaVuSans" size="8.5">goldgem-erp-abc123.vercel.app</font>). You should see the GoldGem ERP dashboard loading with sample data.', body_style))

story.append(Paragraph('Check the following features to confirm everything is working:', body_style))
verify_items = [
    'Dashboard loads with KPI cards showing revenue, orders, and inventory metrics',
    'Navigate to each module using the sidebar: Manufacturing, Supply Chain, Inventory, POS, E-Commerce, AI Insights',
    'The Inventory module should show products across warehouses in New York, London, and Dubai',
    'The POS module should display recent transactions with jewellery items',
    'The E-Commerce module should show online orders from customers worldwide',
    'The Supply Chain module should show purchase orders from international suppliers',
]
for item in verify_items:
    story.append(Paragraph(f'<bullet>&bull;</bullet> {item}', bullet_style))

story.append(Spacer(1, 8))
story.append(Paragraph('If any page shows an error or fails to load data, check the Vercel deployment logs at <font name="DejaVuSans" size="8.5">vercel.com/dashboard</font> then click on your project and go to the "Deployments" tab. Click on the latest deployment to see the build and runtime logs. The most common runtime error is a database connection issue, which is almost always caused by an incorrect or missing DATABASE_URL environment variable.', body_style))

# ──────────── SECTION 10: ENV VARIABLES ────────────
story.append(Paragraph('<b>10. Environment Variables Reference</b>', h1_style))
story.append(Paragraph('Your GoldGem ERP project uses the following environment variables. The DATABASE_URL is the only required variable for production deployment. It must be set both in your local .env file (for running migrations and seeds) and in the Vercel project settings (for the deployed application to connect to the database). The connection string format for Neon PostgreSQL always includes the sslmode=require parameter because Neon requires encrypted connections.', body_style))

env_ref_data = [
    [Paragraph('<b>Variable</b>', header_cell_style), Paragraph('<b>Required</b>', header_cell_style), Paragraph('<b>Description</b>', header_cell_style), Paragraph('<b>Example</b>', header_cell_style)],
    [Paragraph('DATABASE_URL', cell_style), Paragraph('Yes', cell_center_style), Paragraph('Neon PostgreSQL connection string', cell_style), Paragraph('postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require', cell_style)],
]
story.append(Spacer(1, 8))
story.append(make_table(env_ref_data, [page_w*0.17, page_w*0.12, page_w*0.35, page_w*0.36]))
story.append(Spacer(1, 8))
story.append(Paragraph('<b>How to update environment variables on Vercel:</b> Go to your project dashboard on Vercel, click "Settings" tab, then "Environment Variables" in the left sidebar. You can add, edit, or remove variables here. After changing any variable, you must trigger a new deployment for the changes to take effect. You can do this by clicking "Redeploy" on the Deployments tab, or by pushing a new commit to GitHub.', body_style))

# ──────────── SECTION 11: TROUBLESHOOTING ────────────
story.append(Paragraph('<b>11. Troubleshooting Common Issues</b>', h1_style))
story.append(Paragraph('This section covers the most common issues you might encounter during deployment and how to resolve them. Most deployment problems fall into one of three categories: build errors, database connection errors, or runtime errors. The Vercel deployment logs are your primary debugging tool; they show both the build output and the serverless function logs.', body_style))

story.append(Paragraph('<b>Build Error: "prisma generate" fails</b>', h2_style))
story.append(Paragraph('If the build fails during the <font name="DejaVuSans" size="8.5">prisma generate</font> step, it usually means the Prisma schema has a syntax error or the Prisma version is incompatible. Make sure your <font name="DejaVuSans" size="8.5">schema.prisma</font> file has <font name="DejaVuSans" size="8.5">provider = "postgresql"</font> (not "sqlite"). Also ensure the <font name="DejaVuSans" size="8.5">postinstall</font> script in package.json includes <font name="DejaVuSans" size="8.5">prisma generate</font>. Check that the Prisma version in package.json is 6.x or later.', body_style))

story.append(Paragraph('<b>Runtime Error: "P1001: Can\'t reach database server"</b>', h2_style))
story.append(Paragraph('This means the application cannot connect to the Neon database. Check the following: (1) The DATABASE_URL environment variable is set correctly in Vercel Settings, (2) The connection string includes <font name="DejaVuSans" size="8.5">?sslmode=require</font> at the end, (3) The Neon project is active (not suspended due to inactivity; you can wake it up by visiting the Neon dashboard), and (4) Your IP address is not blocked by Neon (Neon does not restrict IPs by default, but corporate firewalls might block the connection).', body_style))

story.append(Paragraph('<b>Runtime Error: "Table does not exist"</b>', h2_style))
story.append(Paragraph('This means you have not run the database migration. Follow Step 5 to run <font name="DejaVuSans" size="8.5">npx prisma db push</font> from your local computer. Make sure your local .env DATABASE_URL points to the same Neon database that Vercel is using. After running the migration, the tables will be created and the application should work immediately without needing to redeploy.', body_style))

story.append(Paragraph('<b>Build Error: "Type error" or TypeScript errors</b>', h2_style))
story.append(Paragraph('The project has <font name="DejaVuSans" size="8.5">ignoreBuildErrors: true</font> set in next.config.ts, which means TypeScript errors should not block the build. If you still see TypeScript-related build failures, check that the <font name="DejaVuSans" size="8.5">next.config.ts</font> file is correctly configured. You can also try running <font name="DejaVuSans" size="8.5">npm run build</font> locally first to identify any issues before deploying.', body_style))

story.append(Paragraph('<b>Blank page / White screen after deployment</b>', h2_style))
story.append(Paragraph('A blank page usually means a JavaScript runtime error. Open your browser\'s Developer Tools (F12) and check the Console tab for error messages. Common causes include: missing environment variables, API routes returning 500 errors due to database issues, or browser caching old assets (try a hard refresh with Ctrl+Shift+R). If the API routes are failing, check the Vercel function logs under the "Functions" tab in your deployment details.', body_style))

# ──────────── SECTION 12: FREE TIER LIMITS ────────────
story.append(Paragraph('<b>12. Free Tier Limits and Tips</b>', h1_style))
story.append(Paragraph('Both Vercel and Neon offer generous free tiers that are more than sufficient for a college project demonstration. However, it is important to understand the limits so your deployment stays active and functional throughout your project evaluation period. The following table summarizes the key limits you should be aware of, along with practical tips to stay within them.', body_style))

limits_data = [
    [Paragraph('<b>Service</b>', header_cell_style), Paragraph('<b>Limit</b>', header_cell_style), Paragraph('<b>What This Means</b>', header_cell_style), Paragraph('<b>Tip</b>', header_cell_style)],
    [Paragraph('Vercel Bandwidth', cell_style), Paragraph('100 GB/month', cell_center_style), Paragraph('Data transfer to visitors', cell_style), Paragraph('More than enough for a demo', cell_style)],
    [Paragraph('Vercel Builds', cell_style), Paragraph('6000 min/month', cell_center_style), Paragraph('Build time for deployments', cell_style), Paragraph('Each build takes 2-5 min', cell_style)],
    [Paragraph('Vercel Functions', cell_style), Paragraph('10 sec timeout', cell_center_style), Paragraph('API route max execution time', cell_style), Paragraph('Prisma cold start may be slow', cell_style)],
    [Paragraph('Neon Storage', cell_style), Paragraph('0.5 GB', cell_center_style), Paragraph('Database size limit', cell_style), Paragraph('Seed data uses less than 5 MB', cell_style)],
    [Paragraph('Neon Compute', cell_style), Paragraph('100 hrs/month', cell_center_style), Paragraph('Active compute time', cell_style), Paragraph('Auto-suspends when idle', cell_style)],
    [Paragraph('Neon Auto-suspend', cell_style), Paragraph('5 min idle', cell_center_style), Paragraph('Pauses after inactivity', cell_style), Paragraph('First request after pause takes 1-2 sec', cell_style)],
]
story.append(Spacer(1, 8))
story.append(make_table(limits_data, [page_w*0.16, page_w*0.16, page_w*0.32, page_w*0.36]))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>Keeping Your Deployment Active</b>', h2_style))
story.append(Paragraph('Neon automatically suspends your database after 5 minutes of inactivity to save compute hours. When a request comes in while the database is suspended, Neon wakes it up automatically, but the first request may take 1-2 seconds longer than usual. This is called a "cold start" and is perfectly normal for serverless databases. For a project demonstration, this delay is negligible. If you need instant responses during a presentation, simply open the application URL a few minutes before the demo to warm up the database connection.', body_style))
story.append(Paragraph('Vercel deployments do not expire. As long as your Vercel account is active, your deployment will remain accessible at its assigned URL. You can also connect a custom domain if you have one, though this is not necessary for a college project. If you want to update your application after the initial deployment, simply push new commits to the GitHub repository and Vercel will automatically rebuild and redeploy within minutes.', body_style))

# ── Build PDF ──
doc.build(story)
print(f"PDF generated successfully: {output_path}")
