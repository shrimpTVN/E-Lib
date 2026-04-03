1.  Graph Code: Luồng giao tiếp và quan hệ file/thư mục
    flowchart TD
    subgraph FE[E-Lib_FrontEnd]
    FE_MAIN[src/main.js] --> FE_APP[src/App.vue]
    FE_APP --> FE_ROUTER[src/router/index.js]

        FE_ROUTER --> FE_VIEWS[src/views/client/* + src/views/admin/* + src/views/Login.vue]
        FE_VIEWS --> FE_COMPS[src/components/*]

        FE_VIEWS --> FE_SVC_BOOK[src/services/book.service.js]
        FE_VIEWS --> FE_SVC_FAV[src/services/favorite.service.js]
        FE_VIEWS --> FE_SVC_USER[src/services/user.service.js]
        FE_VIEWS --> FE_SVC_PUB[src/services/publisher.service.js]

        FE_SVC_BOOK --> FE_SVC_BASE[src/services/base.service.js]
        FE_SVC_FAV --> FE_SVC_BASE
        FE_SVC_USER --> FE_SVC_BASE
        FE_SVC_PUB --> FE_SVC_BASE
        FE_SVC_BASE --> FE_API_FACTORY[src/services/api.service.js]

        FE_LOGIN[src/components/login/LoginForm.vue] --> FE_AXIOS[src/api/axios.js]
        FE_AXIOS --> FE_LS[localStorage token]

    end

subgraph BE[E-Lib_BackEnd]
BE_SERVER[server.js] --> BE_APP[app.js]
BE_SERVER --> BE_CONFIG[app/config/index.js]

    BE_APP --> BE_ROUTES[app/router/routes.js]
    BE_APP --> BE_ERR[app/controller/error.controller.js]
    BE_APP --> BE_COOKIE[cookie-parser middleware]

    BE_ROUTES --> R_LOGIN[app/router/login.route.js]
    BE_ROUTES --> R_REGISTER[app/router/register.route.js]
    BE_ROUTES --> R_BOOK[app/router/book.route.js]
    BE_ROUTES --> R_LOAN[app/router/borrowing.route.js]
    BE_ROUTES --> R_FAV[app/router/favorite.route.js]
    BE_ROUTES --> R_READER[app/router/reader.route.js]
    BE_ROUTES --> R_STAFF[app/router/staff.route.js]

    R_LOGIN --> C_LOGIN[app/controller/login.controller.js]
    R_REGISTER --> C_LOGIN
    R_BOOK --> C_BOOK[app/controller/book.controller.js]
    R_LOAN --> C_LOAN[app/controller/loan.controller.js]
    R_FAV --> C_FAV[app/controller/favorite.controller.js]
    R_READER --> C_READER[app/controller/reader.controller.js]
    R_STAFF --> C_STAFF[app/controller/staff.controller.js]

    C_BOOK --> S_BOOK[app/service/book.service.js]
    C_LOAN --> S_LOAN[app/service/loan.service.js]
    C_READER --> S_READER[app/service/reader.service.js]
    C_STAFF --> S_STAFF[app/service/staff.service.js]
    C_LOGIN --> S_READER
    C_LOGIN --> S_STAFF

    S_BOOK --> M_BOOK[app/model/Book.js]
    S_LOAN --> M_LOAN[app/model/Loan.js]
    S_READER --> M_READER[app/model/Reader.js]
    S_STAFF --> M_STAFF[app/model/Staff.js]

    M_BOOK --> DB[(MongoDB)]
    M_LOAN --> DB
    M_READER --> DB
    M_STAFF --> DB

    BE_AUTH[app/middleware/auth.js]:::partial
    BE_UNUSED[controller/service publisher review history]:::partial

end

FE_API_FACTORY -->|HTTP JSON| BE_ROUTES
FE_AXIOS -->|POST /login + Bearer token| BE_ROUTES

classDef partial fill:#fff3cd,stroke:#b8860b,color:#333;

2. Component Diagram: Vue.js ↔ Express
   flowchart LR
   U1[Reader]
   U2[Staff]
   U3[Admin]

subgraph FE[Frontend Vue]
ROUTER[Vue Router]
V_CLIENT[Client Views\nBookList/BookDetail/Favorite/UserInfo]
V_ADMIN[AdminHomePage]
V_LOGIN[LoginForm + RegisterForm]

    SVC[Service Layer\nBaseService + domain services]
    AX_FAC[Axios factory\nsrc/services/api.service.js]
    AX_AUTH[Auth axios\nsrc/api/axios.js]
    TOKEN[localStorage JWT]

end

subgraph BE[Backend Express]
APP[app.js]
API[Routes\n/login /register /api/books /api/borrowings /api/favorites /api/readers /api/staffs]
CTRL[Controllers]
SRV[Services]
MODEL[Mongoose Models]
AUTH[auth.js middleware]
end

DB[(MongoDB)]

U1 --> ROUTER
U2 --> ROUTER
U3 --> ROUTER

ROUTER --> V_CLIENT
ROUTER --> V_ADMIN
ROUTER --> V_LOGIN

V_CLIENT --> SVC
SVC --> AX_FAC
AX_FAC -->|REST JSON| APP

V_LOGIN --> AX_AUTH
AX_AUTH -->|POST /login| APP
AX_AUTH --> TOKEN
TOKEN --> AX_AUTH

APP --> API
API --> CTRL
CTRL --> SRV
SRV --> MODEL
MODEL --> DB

API -. áp dụng cục bộ .-> AUTH

3. Cây thư mục (Directory Structure + vai trò lõi)
   flowchart TD
   ROOT[E-Lib]

ROOT --> FE[E-Lib_FrontEnd]
ROOT --> BE[E-Lib_BackEnd]

FE --> FE_SRC[src]
FE_SRC --> FE_ROUTER[src/router\nđịnh tuyến client/admin]
FE_SRC --> FE_VIEWS[src/views\ntrang mức route]
FE_SRC --> FE_COMPONENTS[src/components\nUI tái sử dụng]
FE_SRC --> FE_SERVICES[src/services\nCRUD API wrappers]
FE_SRC --> FE_API[src/api\naxios auth riêng]
FE_SRC --> FE_ASSETS[src/assets\nstyle/tài nguyên]

FE --> FE_THEME[theme_files\nmock giao diện tĩnh]
FE --> FE_PUBLIC[public\nstatic assets]

BE --> BE_APP[app]
BE_APP --> BE_ROUTER_DIR[app/router\nkhai báo endpoint]
BE_APP --> BE_CTRL_DIR[app/controller\nxử lý request/response]
BE_APP --> BE_SRV_DIR[app/service\nnghiệp vụ + truy cập model]
BE_APP --> BE_MODEL_DIR[app/model\nschema MongoDB]
BE_APP --> BE_MW_DIR[app/middleware\nauth JWT]
BE_APP --> BE_UTILS_DIR[app/utils\nAppError + tiện ích]

BE --> BE_DB[db\nscript dữ liệu tham chiếu]
BE --> BE_ENTRY[app.js + server.js\nbootstrap server]
