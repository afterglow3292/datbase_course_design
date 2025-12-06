
﻿# Port Logistics Management System

A lightweight Java + MySQL sample project intended for database course design work. The system models common workflows for port logistics: registering ship arrivals, managing cargo assignments, and scheduling berth usage. The code uses a straightforward layered structure and plain JDBC so that the focus stays on SQL and schema design.

## Features
- CLI-driven demo workflow for core logistics scenarios
- Simple domain models for ships, cargo, and berth schedules
- Repository layer implemented with prepared statements
- Service layer that coordinates multi-step operations
- SQL scripts for schema creation and sample data

## Project Layout
```
port-logistics-management/
|-- pom.xml
|-- README.md
`-- src/
    `-- main/
        |-- java/com/portlogistics/
        |   |-- App.java
        |   |-- config/DatabaseManager.java
        |   |-- model/{BerthSchedule,Cargo,Ship}.java
        |   |-- repository/{BerthScheduleRepository,CargoRepository,ShipRepository}.java
        |   `-- service/PortLogisticsService.java
        `-- resources/
            |-- application.properties
            `-- sql/{schema.sql,sample_data.sql}
```

## Prerequisites
- Java 17 or newer
- Apache Maven 3.9+
- MySQL 8.x instance with a database named `port_logistics`

## Getting Started
1. Update `src/main/resources/application.properties` with your MySQL credentials.
2. Load the schema and sample records:
   ```bash
   mysql -u root -p port_logistics < src/main/resources/sql/schema.sql
   mysql -u root -p port_logistics < src/main/resources/sql/sample_data.sql
   ```
3. Build the project:
   ```bash
   mvn clean package
   ```
4. Run the demo CLI:
   ```bash
   mvn exec:java -Dexec.mainClass="com.portlogistics.App"
   ```

### Optional web dashboard
- Open `src/main/resources/static/index.html` in a browser to explore the Bootstrap 5 dashboard prototype.
- The page currently runs on in-memory demo data via JavaScript; connect it to REST endpoints once your Java service layer exposes them.
- Customize styling in `src/main/resources/static/css/custom.css` and interaction logic in `src/main/resources/static/js/app.js`.

## Database Schema (Summary)
- `ship`: vessels participating in port operations
- `cargo`: shipments optionally linked to a ship
- `berth_schedule`: berth assignments with planned arrival and departure windows

## Next Steps
- Extend the repositories with additional queries required by your coursework.
- Replace the CLI with a REST API or graphical interface if desired.
- Add transaction handling or connection pooling once you are comfortable with the basics.

# datbase_course_design
