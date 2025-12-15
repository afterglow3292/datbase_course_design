-- =====================================================
-- 清理冗余索引脚本
-- =====================================================

-- 删除 port 表的冗余索引
DROP INDEX IF EXISTS idx_port_code ON port;
DROP INDEX IF EXISTS idx_port_country ON port;
DROP INDEX IF EXISTS idx_port_name ON port;

-- 删除 ship 表的冗余索引
DROP INDEX IF EXISTS idx_ship_imo ON ship;
DROP INDEX IF EXISTS idx_ship_status ON ship;

-- 删除 berth 表的冗余索引
DROP INDEX IF EXISTS idx_berth_port ON berth;
DROP INDEX IF EXISTS idx_berth_status ON berth;
DROP INDEX IF EXISTS idx_berth_vessel ON berth;

-- 删除 warehouse 表的冗余索引
DROP INDEX IF EXISTS idx_warehouse_port ON warehouse;
DROP INDEX IF EXISTS idx_warehouse_type ON warehouse;
DROP INDEX IF EXISTS idx_warehouse_name ON warehouse;

-- 删除 voyage_plan 表的冗余索引
DROP INDEX IF EXISTS idx_voyage_number ON voyage_plan;
DROP INDEX IF EXISTS idx_voyage_ship ON voyage_plan;
DROP INDEX IF EXISTS idx_voyage_departure_port ON voyage_plan;
DROP INDEX IF EXISTS idx_voyage_arrival_port ON voyage_plan;
DROP INDEX IF EXISTS idx_voyage_status ON voyage_plan;
DROP INDEX IF EXISTS idx_voyage_planned_departure ON voyage_plan;

-- 删除 cargo 表的冗余索引
DROP INDEX IF EXISTS idx_cargo_voyage ON cargo;
DROP INDEX IF EXISTS idx_cargo_warehouse ON cargo;
DROP INDEX IF EXISTS idx_cargo_destination ON cargo;
DROP INDEX IF EXISTS idx_cargo_status ON cargo;

-- 删除 transport_task 表的冗余索引
DROP INDEX IF EXISTS idx_task_number ON transport_task;
DROP INDEX IF EXISTS idx_task_cargo ON transport_task;
DROP INDEX IF EXISTS idx_task_status ON transport_task;
DROP INDEX IF EXISTS idx_task_planned_pickup ON transport_task;

-- 重新创建索引
CREATE INDEX idx_port_code ON port(port_code);
CREATE INDEX idx_port_country ON port(country);

CREATE INDEX idx_ship_imo ON ship(imo);
CREATE INDEX idx_ship_status ON ship(status);

CREATE INDEX idx_berth_port ON berth(port_id);
CREATE INDEX idx_berth_status ON berth(status);
CREATE INDEX idx_berth_vessel ON berth(current_vessel_id);

CREATE INDEX idx_warehouse_port ON warehouse(port_id);
CREATE INDEX idx_warehouse_type ON warehouse(warehouse_type);

CREATE INDEX idx_voyage_number ON voyage_plan(voyage_number);
CREATE INDEX idx_voyage_ship ON voyage_plan(ship_id);
CREATE INDEX idx_voyage_departure_port ON voyage_plan(departure_port_id);
CREATE INDEX idx_voyage_arrival_port ON voyage_plan(arrival_port_id);
CREATE INDEX idx_voyage_status ON voyage_plan(voyage_status);

CREATE INDEX idx_cargo_voyage ON cargo(voyage_plan_id);
CREATE INDEX idx_cargo_warehouse ON cargo(warehouse_id);
CREATE INDEX idx_cargo_destination ON cargo(destination);
CREATE INDEX idx_cargo_status ON cargo(status);

CREATE INDEX idx_task_number ON transport_task(task_number);
CREATE INDEX idx_task_cargo ON transport_task(cargo_id);
CREATE INDEX idx_task_status ON transport_task(status);
