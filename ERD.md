erDiagram
    %% Entities
    USER_ACCOUNT {
        int id PK "Auto-increment"
        string name "Head Kashaf"
        string password "1234"
        string name "Head 2ashbal"
        string password "1234"
        string name "Head bar3m"
        string password "1234"
        string name "Head motakdam"
        string password "1234"
        string name "Head gawala"
        string password "1234"
        string name "Head morasha7"
        string password "1234"
        string name "Head"
        string password "1234"
        string name "admin"
        string password "1234"
    }

    USER_DEPARTMENT{
        int id PK
        int user_id FK "1"
        int department_id FK "1"
         int user_id FK "3"
        int department_id FK "2" 
         int user_id FK "5"
        int department_id FK "3"
         int user_id FK "7"
        int department_id FK "4"
         int user_id FK "9"
        int department_id FK "6"
         int user_id FK "11"
        int department_id FK "5"
         int user_id FK "13"
        int department_id FK "1"
        int department_id FK "2"
        int department_id FK "3"
        int department_id FK "4"
        int department_id FK "5"
        int department_id FK "6"
        int user_id FK "15"
        int department_id FK "1"
        int department_id FK "2"
        int department_id FK "3"
        int department_id FK "4"
        int department_id FK "5"
        int department_id FK "6"
    }
    
    DEPARTMENT {
        int id PK 
        string kashaf
        string ashbal
        string bar3ma
        string motakdam
        string morasha7
        string gawala

    }
    
    MEMBER {
        int id PK
        string firstNameAr
        string secondNameAr
        string thirdNameAr
        string fourthNameAr
        string fullNameEn
        string birthDate
        string nationalId
        string location
        string phoneNumber
        string email
        string role
        int departmentId FK
        string status
        string joinDate
    }
    
    MEETING {
        int id PK
        string title
        string date
    }
    
    ATTENDEE {
        int memberId PK
        string name
        string status
        int meetingId PK
    }
    
    TRANSFER_RECORD {
        int id PK
        int memberId FK
        string memberName
        int fromDepartmentId FK
        int toDepartmentId FK
        string transferDate
        string transferredBy
        string status
    }
    
    TRANSFER_LADDER {
        int sourceDeptId PK
        int targetDeptId
    }
    
    %% Relationships
    %% USER_ACCOUNT ||--o{ DEPARTMENT : "can manage"
    DEPARTMENT ||--o{ MEMBER : "contains"
    DEPARTMENT ||--o{ TRANSFER_RECORD : "source"
    DEPARTMENT ||--o{ TRANSFER_RECORD : "destination"
    MEMBER ||--o{ ATTENDEE : "participates in"
    MEETING ||--o{ ATTENDEE : "has"
    MEMBER ||--o{ TRANSFER_RECORD : "transferred"
    DEPARTMENT ||--o{ TRANSFER_LADDER : "source"
    DEPARTMENT ||--o{ TRANSFER_LADDER : "target"
    USER_ACCOUNT ||--O{ USER_DEPARTMENT : "manages"
    DEPARTMENT ||--O{ USER_DEPARTMENT : "managed by"