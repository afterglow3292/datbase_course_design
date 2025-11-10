CREATE TABLE IF NOT EXISTS ship (
    ship_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    imo VARCHAR(20) NOT NULL UNIQUE,
    capacity_teu INT NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cargo (
    cargo_id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    weight DECIMAL(10, 2) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    ship_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cargo_ship FOREIGN KEY (ship_id) REFERENCES ship(ship_id)
);

CREATE TABLE IF NOT EXISTS berth_schedule (
    berth_id INT AUTO_INCREMENT PRIMARY KEY,
    ship_id INT NOT NULL,
    berth_number VARCHAR(20) NOT NULL,
    arrival_time DATETIME NOT NULL,
    departure_time DATETIME NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_schedule_ship FOREIGN KEY (ship_id) REFERENCES ship(ship_id)
);

CREATE INDEX idx_cargo_destination ON cargo(destination);
CREATE INDEX idx_berth_schedule_arrival ON berth_schedule(arrival_time);
