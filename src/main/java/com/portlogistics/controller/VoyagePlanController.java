package com.portlogistics.controller;

import com.portlogistics.model.VoyagePlan;
import com.portlogistics.service.VoyagePlanService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/voyages")
public class VoyagePlanController {

    private final VoyagePlanService voyagePlanService;

    public VoyagePlanController(VoyagePlanService voyagePlanService) {
        this.voyagePlanService = voyagePlanService;
    }

    @GetMapping
    public ResponseEntity<?> list() {
        try {
            List<VoyagePlan> plans = voyagePlanService.getAllPlans();
            return ResponseEntity.ok(plans);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "数据库错误：" + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        try {
            VoyagePlan plan = voyagePlanService.getPlanById(id);
            if (plan == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(plan);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "数据库错误：" + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> request) {
        try {
            VoyagePlan plan = mapRequestToPlan(request);
            voyagePlanService.createPlan(plan);
            return ResponseEntity.ok(Map.of("success", true, "message", "航次计划创建成功"));
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
            VoyagePlan plan = mapRequestToPlan(request);
            plan.setPlanId(id);
            voyagePlanService.updatePlan(plan);
            return ResponseEntity.ok(Map.of("success", true, "message", "航次计划更新成功"));
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
            voyagePlanService.deletePlan(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "航次计划已删除"));
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "数据库错误：" + e.getMessage()));
        }
    }

    private VoyagePlan mapRequestToPlan(Map<String, Object> request) {
        VoyagePlan plan = new VoyagePlan();
        plan.setVoyageNumber((String) request.get("voyageNumber"));
        plan.setShipId(parseInteger(request.get("shipId")));
        plan.setDeparturePort((String) request.get("departurePort"));
        plan.setArrivalPort((String) request.get("arrivalPort"));
        plan.setAssignedBerthId(request.get("assignedBerthId") != null ? parseInteger(request.get("assignedBerthId")) : null);
        plan.setPlannedDeparture(voyagePlanService.parseDateTime((String) request.get("plannedDeparture")));
        plan.setPlannedArrival(voyagePlanService.parseDateTime((String) request.get("plannedArrival")));
        plan.setActualDeparture(voyagePlanService.parseDateTime((String) request.get("actualDeparture")));
        plan.setActualArrival(voyagePlanService.parseDateTime((String) request.get("actualArrival")));
        plan.setVoyageStatus((String) request.getOrDefault("voyageStatus", "PLANNED"));
        plan.setCreatedBy(request.get("createdBy") != null ? parseInteger(request.get("createdBy")) : null);
        return plan;
    }

    private int parseInteger(Object value) {
        if (value == null) return 0;
        if (value instanceof Integer) return (Integer) value;
        if (value instanceof String) return Integer.parseInt((String) value);
        if (value instanceof Number) return ((Number) value).intValue();
        return 0;
    }
}
