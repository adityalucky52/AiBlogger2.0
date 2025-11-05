# AiBlogger 2.0 - Flowchart Documentation

This document contains comprehensive flowcharts for the AiBlogger application architecture and workflows.

---

## 1. User Flow Diagram

Complete user journey showing both visitor and admin paths through the application.

```mermaid
flowchart TD
    Start([User Visits AiBlogger]) --> Choice{User Type?}
    
    Choice -->|Visitor| Public[Public Interface]
    Choice -->|Admin| AdminLogin{Logged In?}
    
    AdminLogin -->|No| Login[Login Page]
    Login --> Auth[JWT Authentication]
    Auth -->|Success| Admin[Admin Dashboard]
    Auth -->|Fail| Login
    
    Public --> ViewBlogs[Browse Blog List]
    ViewBlogs --> SelectBlog[Select Blog]
    SelectBlog --> ReadBlog[Read Full Blog]
    ReadBlog --> ViewComments[View Approved Comments]
    ViewComments --> AddComment[Add Comment]
    AddComment --> AwaitApproval[Awaiting Admin Approval]
    
    AdminLogin -->|Yes| Admin
    Admin --> AdminChoice{Admin Action?}
    
    AdminChoice -->|Create| CreateBlog[Create New Blog]
    AdminChoice -->|Manage| ManageBlogs[Manage Existing Blogs]
    AdminChoice -->|Comments| ModerateComments[Moderate Comments]
    AdminChoice -->|Stats| ViewDashboard[View Dashboard Stats]
    
    CreateBlog --> UploadImage[Upload Thumbnail]
    UploadImage --> ImageKit[ImageKit CDN Processing]
    ImageKit --> EnterDetails[Enter Blog Details]
    EnterDetails --> ContentChoice{Content Creation?}
    
    ContentChoice -->|Manual| WriteContent[Write Content Manually]
    ContentChoice -->|AI| AIGenerate[Generate with Gemini AI]
    
    AIGenerate --> GeminiAPI[Google Gemini API]
    GeminiAPI --> ParseContent[Parse AI Response]
    ParseContent --> QuillEditor[Rich Text Editor]
    
    WriteContent --> QuillEditor
    QuillEditor --> PublishChoice{Publish Now?}
    
    PublishChoice -->|Yes| PublishBlog[Publish Blog]
    PublishChoice -->|No| SaveDraft[Save as Draft]
    
    PublishBlog --> MongoDB[(Save to MongoDB)]
    SaveDraft --> MongoDB
    
    ManageBlogs --> ListAll[List All Blogs]
    ListAll --> BlogAction{Action?}
    BlogAction -->|Toggle| ToggleStatus[Publish/Unpublish]
    BlogAction -->|Delete| DeleteBlog[Delete Blog]
    ToggleStatus --> MongoDB
    DeleteBlog --> MongoDB
    
    ModerateComments --> ListComments[List All Comments]
    ListComments --> CommentAction{Action?}
    CommentAction -->|Approve| ApproveComment[Approve Comment]
    CommentAction -->|Delete| DeleteComment[Delete Comment]
    ApproveComment --> MongoDB
    DeleteComment --> MongoDB
    
    ViewDashboard --> FetchStats[Fetch Statistics]
    FetchStats --> DisplayStats[Display Blogs/Comments/Drafts]
    
    MongoDB --> Success[Operation Complete]
    Success --> Admin
    
    style Start fill:#4CAF50,stroke:#2E7D32,color:#fff
    style Admin fill:#FF9800,stroke:#E65100,color:#fff
    style MongoDB fill:#2196F3,stroke:#1565C0,color:#fff
    style GeminiAPI fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style ImageKit fill:#00BCD4,stroke:#00838F,color:#fff
```

---

## 2. System Architecture Flowchart

Complete system overview showing all components and their connections.

```mermaid
graph TB
    subgraph "CLIENT - React + Vite"
        A[User/Visitor] --> B{Authenticated?}
        B -->|No| C[Public Pages]
        B -->|Yes| D[Admin Panel]
        
        C --> C1[Home - Blog List]
        C --> C2[Blog Details]
        C --> C3[Add Comment]
        
        D --> D1[Dashboard]
        D --> D2[Add Blog]
        D --> D3[List Blogs]
        D --> D4[Manage Comments]
        
        D2 --> D2a[Upload Image]
        D2 --> D2b[Enter Details]
        D2 --> D2c[AI Generate Content]
        D2 --> D2d[Publish/Draft]
    end
    
    subgraph "API - Express Server"
        E[Express Router]
        E --> F[Blog Routes]
        E --> G[Admin Routes]
        
        F --> F1[POST /add]
        F --> F2[GET /all]
        F --> F3[GET /:blogId]
        F --> F4[POST /delete]
        F --> F5[POST /toggle-publish]
        F --> F6[POST /add-comment]
        F --> F7[POST /comments]
        F --> F8[POST /generate]
        
        G --> G1[POST /login]
        G --> G2[GET /comments]
        G --> G3[GET /blogs]
        G --> G4[POST /delete-comment]
        G --> G5[POST /approve-comment]
        G --> G6[GET /dashboard]
    end
    
    subgraph "MIDDLEWARE"
        H1[JWT Auth]
        H2[Multer Upload]
        H3[CORS]
    end
    
    subgraph "CONTROLLERS"
        I1[Blog Controller]
        I2[Admin Controller]
    end
    
    subgraph "DATABASE"
        J[(MongoDB Atlas)]
        J --> K[Blog Collection]
        J --> L[Comment Collection]
    end
    
    subgraph "EXTERNAL SERVICES"
        M[ImageKit CDN]
        N[Google Gemini AI]
    end
    
    C1 --> F2
    C2 --> F3
    C3 --> F6
    
    D2 --> F1
    D2c --> F8
    D3 --> F5
    D3 --> F4
    D4 --> G2
    D4 --> G4
    D4 --> G5
    D1 --> G6
    
    F1 --> H1
    F1 --> H2
    F8 --> H1
    G2 --> H1
    G3 --> H1
    
    F --> I1
    G --> I2
    
    I1 --> J
    I2 --> J
    I1 --> M
    I1 --> N
    
    style J fill:#4CAF50,stroke:#2E7D32,color:#fff
    style M fill:#FF9800,stroke:#E65100,color:#fff
    style N fill:#9C27B0,stroke:#6A1B9A,color:#fff
```

---

## 3. Create Blog Flow

Detailed step-by-step process for creating a blog post with AI generation.

```mermaid
flowchart LR
    Start([Admin Logs In]) --> Dashboard[Admin Dashboard]
    Dashboard --> ClickAdd[Click 'Add Blog']
    ClickAdd --> Form[Blog Form Page]
    
    Form --> Step1[1. Upload Thumbnail Image]
    Step1 --> Step2[2. Enter Blog Title]
    Step2 --> Step3[3. Enter Subtitle]
    Step3 --> Step4[4. Choose Category]
    
    Step4 --> ContentDecision{How to create content?}
    
    ContentDecision -->|Manual| Manual[Write in Rich Text Editor]
    ContentDecision -->|AI| ClickAI[Click 'Generate with AI']
    
    ClickAI --> CheckTitle{Title Present?}
    CheckTitle -->|No| ShowError[Show Error: Title Required]
    ShowError --> Step2
    
    CheckTitle -->|Yes| CallAPI[POST /api/blog/generate]
    CallAPI --> SendPrompt[Send Title as Prompt]
    SendPrompt --> GeminiAPI[Gemini AI Processes]
    GeminiAPI --> ReturnContent[Return Generated Content]
    ReturnContent --> ParseMarkdown[Parse Markdown to HTML]
    ParseMarkdown --> FillEditor[Fill Quill Editor]
    
    Manual --> Editor[Rich Text Editor]
    FillEditor --> Editor
    
    Editor --> Step5[5. Review Content]
    Step5 --> Step6[6. Select Publish/Draft]
    
    Step6 --> PublishCheck{Publish Now?}
    PublishCheck -->|Yes| SetPublished[isPublished = true]
    PublishCheck -->|No| SetDraft[isPublished = false]
    
    SetPublished --> ClickSubmit[Click 'Add Blog']
    SetDraft --> ClickSubmit
    
    ClickSubmit --> UploadImage[Upload Image to ImageKit]
    UploadImage --> OptimizeImage[Optimize & Convert to WebP]
    OptimizeImage --> GetImageURL[Get CDN URL]
    
    GetImageURL --> CreateBlogDoc[Create Blog Document]
    CreateBlogDoc --> SaveMongo[Save to MongoDB]
    SaveMongo --> Success[Show Success Message]
    Success --> ResetForm[Reset Form]
    ResetForm --> Dashboard
    
    style GeminiAPI fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style SaveMongo fill:#4CAF50,stroke:#2E7D32,color:#fff
```

---

## 4. Comment Moderation Flow

How comments are submitted by visitors and moderated by admins.

```mermaid
flowchart TD
    Visitor[Visitor Reads Blog] --> CommentForm[Fill Comment Form]
    CommentForm --> EnterName[Enter Name]
    EnterName --> EnterComment[Enter Comment Text]
    EnterComment --> Submit[Submit Comment]
    
    Submit --> SaveComment[Save to MongoDB]
    SaveComment --> SetNotApproved[isApproved = false]
    SetNotApproved --> ShowMessage[Show: 'Comment added for review']
    
    ShowMessage --> WaitAdmin[Wait for Admin Approval]
    
    Admin[Admin Login] --> ViewComments[View Comments Page]
    ViewComments --> Filter{Filter By?}
    
    Filter -->|Not Approved| ShowPending[Show Pending Comments]
    Filter -->|Approved| ShowApproved[Show Approved Comments]
    
    ShowPending --> ReviewComment[Review Comment]
    ReviewComment --> AdminDecision{Decision?}
    
    AdminDecision -->|Approve| ClickApprove[Click Approve]
    AdminDecision -->|Delete| ClickDelete[Click Delete]
    
    ClickApprove --> UpdateDB[Update isApproved = true]
    UpdateDB --> RefreshList[Refresh Comments List]
    RefreshList --> PublicView[Comment Visible on Blog]
    
    ClickDelete --> ConfirmDelete{Confirm Delete?}
    ConfirmDelete -->|Yes| DeleteFromDB[Delete from MongoDB]
    ConfirmDelete -->|No| ViewComments
    DeleteFromDB --> RefreshList
    
    style Admin fill:#FF9800,stroke:#E65100,color:#fff
    style PublicView fill:#4CAF50,stroke:#2E7D32,color:#fff
```

---

## 5. API Request Flow

How HTTP requests flow through the backend system.

```mermaid
flowchart LR
    Client[React Client] --> Request[HTTP Request]
    
    Request --> Router[Express Router]
    Router --> RouteCheck{Route Type?}
    
    RouteCheck -->|Public| PublicRoute[/api/blog/all<br/>/api/blog/:id<br/>/api/blog/comments]
    RouteCheck -->|Protected| AuthMiddleware[Auth Middleware]
    
    AuthMiddleware --> CheckToken{Valid JWT?}
    CheckToken -->|No| Return401[Return 401 Unauthorized]
    CheckToken -->|Yes| ProtectedRoute[Protected Endpoints]
    
    ProtectedRoute --> AdminRoute[/api/admin/*<br/>/api/blog/add<br/>/api/blog/generate]
    
    PublicRoute --> Controller[Controller Function]
    AdminRoute --> Controller
    
    Controller --> ProcessCheck{Needs Processing?}
    
    ProcessCheck -->|Upload| Multer[Multer Middleware]
    ProcessCheck -->|AI| Gemini[Gemini AI Call]
    ProcessCheck -->|Image| ImageKit[ImageKit CDN]
    ProcessCheck -->|No| DirectDB[Direct Database Call]
    
    Multer --> MongoDB[(MongoDB)]
    Gemini --> MongoDB
    ImageKit --> MongoDB
    DirectDB --> MongoDB
    
    MongoDB --> Result{Success?}
    
    Result -->|Yes| SuccessResponse[200 OK<br/>success: true<br/>data: ...]
    Result -->|No| ErrorResponse[500 Error<br/>success: false<br/>message: error]
    
    SuccessResponse --> Client
    ErrorResponse --> Client
    Return401 --> Client
    
    style SuccessResponse fill:#4CAF50,stroke:#2E7D32,color:#fff
    style ErrorResponse fill:#f44336,stroke:#c62828,color:#fff
    style Return401 fill:#FF9800,stroke:#E65100,color:#fff
```

---

## 6. Authentication Flow

JWT token-based authentication system for admin access.

```mermaid
flowchart TD
    Start([User Visits /admin]) --> CheckToken{Token in LocalStorage?}
    
    CheckToken -->|Yes| ValidateToken[Validate JWT Token]
    CheckToken -->|No| ShowLogin[Show Login Page]
    
    ValidateToken --> TokenValid{Token Valid?}
    TokenValid -->|Yes| ShowDashboard[Show Admin Dashboard]
    TokenValid -->|No| ShowLogin
    
    ShowLogin --> EnterCreds[Enter Email & Password]
    EnterCreds --> SubmitLogin[Submit Login Form]
    
    SubmitLogin --> SendRequest[POST /api/admin/login]
    SendRequest --> CheckCreds{Credentials Match .env?}
    
    CheckCreds -->|No| ShowError[Show Error: Invalid Credentials]
    ShowError --> ShowLogin
    
    CheckCreds -->|Yes| GenerateJWT[Generate JWT Token]
    GenerateJWT --> ReturnToken[Return Token to Client]
    ReturnToken --> SaveLocal[Save to LocalStorage]
    SaveLocal --> SetHeader[Set Authorization Header]
    SetHeader --> ShowDashboard
    
    ShowDashboard --> UserAction{User Action?}
    UserAction -->|Navigate| IncludeToken[Include Token in Request]
    UserAction -->|Logout| ClearToken[Clear LocalStorage]
    
    IncludeToken --> APICall[API Call with Auth Header]
    APICall --> VerifyToken[Server Verifies Token]
    VerifyToken --> AllowAccess[Allow Access]
    
    ClearToken --> ShowLogin
    
    style ShowDashboard fill:#4CAF50,stroke:#2E7D32,color:#fff
    style ShowError fill:#f44336,stroke:#c62828,color:#fff
    style GenerateJWT fill:#2196F3,stroke:#1565C0,color:#fff
```

---

## 7. Data Flow Sequence Diagram

Complete sequence of interactions between components.

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client (React)
    participant API as Express API
    participant Auth as Auth Middleware
    participant Ctrl as Controllers
    participant DB as MongoDB
    participant AI as Gemini AI
    participant CDN as ImageKit CDN
    
    Note over U,CDN: Admin Login Flow
    U->>C: Enter Credentials
    C->>API: POST /api/admin/login
    API->>Ctrl: adminLogin()
    Ctrl->>Ctrl: Verify Credentials
    Ctrl->>Ctrl: Generate JWT Token
    Ctrl-->>C: Return Token
    C->>C: Store Token
    
    Note over U,CDN: Create Blog with AI Flow
    U->>C: Upload Image & Title
    C->>API: POST /api/blog/generate
    API->>Auth: Verify JWT
    Auth->>Ctrl: generateContent()
    Ctrl->>AI: Request Blog Content
    AI-->>Ctrl: Return Generated Text
    Ctrl-->>C: Return Content
    C->>C: Display in Quill Editor
    
    U->>C: Submit Blog Form
    C->>API: POST /api/blog/add (FormData)
    API->>Auth: Verify JWT
    Auth->>Ctrl: addBlog()
    Ctrl->>CDN: Upload Image
    CDN-->>Ctrl: Return Image URL
    Ctrl->>DB: Save Blog Document
    DB-->>Ctrl: Success
    Ctrl-->>C: Blog Created
    C-->>U: Show Success Message
    
    Note over U,CDN: Public View Blog Flow
    U->>C: Visit Blog Page
    C->>API: GET /api/blog/:id
    API->>Ctrl: getBlogById()
    Ctrl->>DB: Find Blog
    DB-->>Ctrl: Return Blog Data
    Ctrl-->>C: Blog Details
    C-->>U: Display Blog
    
    Note over U,CDN: Add Comment Flow
    U->>C: Submit Comment
    C->>API: POST /api/blog/add-comment
    API->>Ctrl: addComment()
    Ctrl->>DB: Save Comment (isApproved: false)
    DB-->>Ctrl: Success
    Ctrl-->>C: Comment Submitted
    C-->>U: Awaiting Approval Message
    
    Note over U,CDN: Admin Approve Comment
    U->>C: Click Approve
    C->>API: POST /api/admin/approve-comment
    API->>Auth: Verify JWT
    Auth->>Ctrl: approveCommentById()
    Ctrl->>DB: Update Comment (isApproved: true)
    DB-->>Ctrl: Success
    Ctrl-->>C: Comment Approved
    C-->>U: Show Success
```

---

## Technology Stack

### Frontend
- **React** - UI Library
- **Vite** - Build Tool
- **React Router** - Navigation
- **Quill** - Rich Text Editor
- **React Hot Toast** - Notifications
- **Marked** - Markdown Parser

### Backend
- **Express** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File Upload
- **CORS** - Cross-Origin Support

### External Services
- **Google Gemini AI** - AI Content Generation
- **ImageKit** - CDN & Image Optimization

---

## API Endpoints

### Blog Routes (`/api/blog`)
- `POST /add` - Create new blog (Protected)
- `GET /all` - Get all published blogs (Public)
- `GET /:blogId` - Get single blog (Public)
- `POST /delete` - Delete blog (Protected)
- `POST /toggle-publish` - Toggle publish status (Protected)
- `POST /add-comment` - Add comment (Public)
- `POST /comments` - Get approved comments (Public)
- `POST /generate` - Generate content with AI (Protected)

### Admin Routes (`/api/admin`)
- `POST /login` - Admin login (Public)
- `GET /comments` - Get all comments (Protected)
- `GET /blogs` - Get all blogs (Protected)
- `POST /delete-comment` - Delete comment (Protected)
- `POST /approve-comment` - Approve comment (Protected)
- `GET /dashboard` - Get dashboard stats (Protected)

---

## Database Schema

### Blog Collection
```javascript
{
  title: String,
  subTitle: String,
  description: String (HTML),
  category: String,
  image: String (CDN URL),
  isPublished: Boolean,
  createdAt: Date
}
```

### Comment Collection
```javascript
{
  blog: ObjectId (ref: Blog),
  name: String,
  content: String,
  isApproved: Boolean,
  createdAt: Date
}
```

---

## How to View These Diagrams

1. **GitHub/GitLab** - These platforms render Mermaid diagrams automatically
2. **VS Code** - Install "Markdown Preview Mermaid Support" extension
3. **Online** - Visit [mermaid.live](https://mermaid.live/) and paste the code
4. **Other Tools** - Any Markdown viewer with Mermaid support

---

## Project Structure

```
AiBlogger2.0/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Context API
│   │   └── assets/        # Static assets
│   └── package.json
│
└── server/                # Express Backend
    ├── controllers/       # Business logic
    ├── models/           # MongoDB schemas
    ├── routes/           # API routes
    ├── middleware/       # Auth & file upload
    ├── configs/          # DB, Gemini, ImageKit
    └── package.json
```

---

**Created for AiBlogger 2.0** - A modern blog platform with AI-powered content generation
