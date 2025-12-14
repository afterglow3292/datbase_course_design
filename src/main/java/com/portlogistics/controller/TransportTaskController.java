package com.portlogistics.controller;

import com.portlogistics.model.TransportTask;
import com.portlogistics.service.TransportTaskService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transport-tasks")
public class TransportTaskController {

    private final TransportTaskService transportTaskService;

    public TransportTaskController(TransportTaskService transportTaskService) {
        this.transportTaskService = transportTaskService;
    }

    @GetMapping
    public ResponseEntity<?> list() {
        try {
            List<TransportTask> tasks = transportTaskService.getAllTasks();
            return ResponseEntity.ok(tasks);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "数据库错误：" + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        try {
            TransportTask task = transportTaskService.getTaskById(id);
            if (task == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(task);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "数据库错误：" + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> request) {
        try {
            TransportTask task = mapRequestToTask(request);
            transportTaskService.createTask(task);
            return ResponseEntity.ok(Map.of("success", true, "message", "运输任务创建成功"));
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
            TransportTask task = mapRequestToTask(request);
            task.setTaskId(id);
            transportTaskService.updateTask(task);
            return ResponseEntity.ok(Map.of("success", true, "message", "运输任务更新成功"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "数据库错误：" + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable int id, @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "状态不能为空"));
            }
            transportTaskService.updateStatus(id, newStatus);
            return ResponseEntity.ok(Map.of("success", true, "message", "状态更新成功"));
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
            transportTaskService.deleteTask(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "运输任务已删除"));
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "数据库错误：" + e.getMessage()));
        }
    }

    private TransportTask mapRequestToTask(Map<String, Object> request) {
        TransportTask task = new TransportTask();
        task.setTaskNumber((String) request.get("taskNumber"));
        task.setCargoId(request.get("cargoId") != null ? parseInteger(request.get("cargoId")) : null);
        task.setTruckLicense((String) request.get("truckLicense"));
        task.setDriverName((String) request.get("driverName"));
        task.setDriverPhone((String) request.get("driverPhone"));
        task.setPickupLocation((String) request.get("pickupLocation"));
        task.setDeliveryLocation((String) request.get("deliveryLocation"));
        task.setPlannedPickup(transportTaskService.parseDateTime((String) request.get("plannedPickup")));
        task.setActualPickup(transportTaskService.parseDateTime((String) request.get("actualPickup")));
        task.setPlannedDelivery(transportTaskService.parseDateTime((String) request.get("plannedDelivery")));
        task.setActualDelivery(transportTaskService.parseDateTime((String) request.get("actualDelivery")));
        task.setStatus((String) request.getOrDefault("status", "PENDING"));
        return task;
    }

    private Integer parseInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Integer) return (Integer) value;
        if (value instanceof String) {
            String str = (String) value;
            if (str.isEmpty()) return null;
            return Integer.parseInt(str);
        }
        if (value instanceof Number) return ((Number) value).intValue();
        return null;
    }
}
