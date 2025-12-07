package com.portlogistics.controller;

import com.portlogistics.model.Warehouse;
import com.portlogistics.service.WarehouseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/warehouses")
public class WarehouseController {

    private final WarehouseService warehouseService;

    public WarehouseController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required = false) String q) {
        try {
            List<Warehouse> warehouses;
            if (q != null && !q.trim().isEmpty()) {
                warehouses = warehouseService.searchWarehouses(q);
            } else {
                warehouses = warehouseService.getAllWarehouses();
            }
            return ResponseEntity.ok(warehouses);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "数据库错误：" + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        try {
            Warehouse warehouse = warehouseService.getWarehouseById(id);
            if (warehouse == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(warehouse);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "数据库错误：" + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> request) {
        try {
            Warehouse warehouse = mapRequestToWarehouse(request);
            warehouseService.createWarehouse(warehouse);
            return ResponseEntity.ok(Map.of("success", true, "message", "仓库创建成功"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "数据库错误：" + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody Map<String, Object> request) {
        try {
            Warehouse warehouse = mapRequestToWarehouse(request);
            warehouse.setWarehouseId(id);
            warehouseService.updateWarehouse(warehouse);
            return ResponseEntity.ok(Map.of("success", true, "message", "仓库更新成功"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "数据库错误：" + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        try {
            warehouseService.deleteWarehouse(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "仓库已删除"));
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "数据库错误：" + e.getMessage()));
        }
    }

    private Warehouse mapRequestToWarehouse(Map<String, Object> request) {
        Warehouse warehouse = new Warehouse();
        warehouse.setWarehouseName((String) request.get("warehouseName"));
        warehouse.setPortId(request.get("portId") != null ? parseInteger(request.get("portId")) : null);
        warehouse.setWarehouseType((String) request.get("warehouseType"));
        warehouse.setTotalCapacity(parseBigDecimal(request.get("totalCapacity")));
        warehouse.setUsedCapacity(parseBigDecimal(request.get("usedCapacity")));
        warehouse.setLocation((String) request.get("location"));
        return warehouse;
    }

    private int parseInteger(Object value) {
        if (value == null) return 0;
        if (value instanceof Integer) return (Integer) value;
        if (value instanceof String) return Integer.parseInt((String) value);
        if (value instanceof Number) return ((Number) value).intValue();
        return 0;
    }

    private BigDecimal parseBigDecimal(Object value) {
        if (value == null) return null;
        if (value instanceof BigDecimal) return (BigDecimal) value;
        if (value instanceof Number) return BigDecimal.valueOf(((Number) value).doubleValue());
        if (value instanceof String) return new BigDecimal((String) value);
        return null;
    }
}
