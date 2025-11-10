INSERT INTO ship (name, imo, capacity_teu, status) VALUES
    ('Evergreen Aurora', 'IMO1234567', 20000, 'ARRIVED'),
    ('Pacific Trader', 'IMO2345678', 8500, 'AT SEA'),
    ('Harbor Breeze', 'IMO3456789', 12000, 'SCHEDULED');

INSERT INTO cargo (description, weight, destination, ship_id) VALUES
    ('Electronics batch A', 4500.50, 'Shanghai', NULL),
    ('Automotive parts', 7800.00, 'Los Angeles', NULL),
    ('Frozen seafood', 3200.75, 'Tokyo', 1);

INSERT INTO berth_schedule (ship_id, berth_number, arrival_time, departure_time, status) VALUES
    (1, 'B-12', '2025-05-01 08:00:00', '2025-05-02 02:00:00', 'CONFIRMED'),
    (3, 'A-03', '2025-05-03 14:30:00', NULL, 'PLANNED');
