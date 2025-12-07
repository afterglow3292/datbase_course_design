package com.portlogistics.service;

import com.portlogistics.model.VoyagePlan;
import com.portlogistics.repository.VoyagePlanRepository;
import com.portlogistics.repository.ShipRepository;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class VoyagePlanService {
    private final VoyagePlanRepository voyagePlanRepository;
    private final ShipRepository shipRepository;

    public VoyagePlanService(VoyagePlanRepository voyagePlanRepository, ShipRepository shipRepository) {
        this.voyagePlanRepository = voyagePlanRepository;
        this.shipRepository = shipRepository;
    }

    public List<VoyagePlan> getAllPlans() throws SQLException {
        return voyagePlanRepository.findAll();
    }

    public VoyagePlan getPlanById(int planId) throws SQLException {
        return voyagePlanRepository.findById(planId);
    }

    public void createPlan(VoyagePlan plan) throws SQLException {
        validatePlan(plan, 0);
        if (plan.getVoyageStatus() == null || plan.getVoyageStatus().isEmpty()) {
            plan.setVoyageStatus("PLANNED");
        }
        voyagePlanRepository.save(plan);
    }

    public void updatePlan(VoyagePlan plan) throws SQLException {
        validatePlan(plan, plan.getPlanId());
        voyagePlanRepository.update(plan);
    }

    public void deletePlan(int planId) throws SQLException {
        voyagePlanRepository.deleteById(planId);
    }

    private void validatePlan(VoyagePlan plan, int excludeId) throws SQLException {
        // 验证航次编号
        if (plan.getVoyageNumber() == null || plan.getVoyageNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("航次编号不能为空");
        }
        // 检查航次编号是否重复
        if (voyagePlanRepository.isVoyageNumberExists(plan.getVoyageNumber().trim(), excludeId)) {
            throw new IllegalArgumentException("航次编号已存在");
        }
        // 验证船舶
        if (plan.getShipId() <= 0) {
            throw new IllegalArgumentException("请选择船舶");
        }
        if (!shipRepository.existsById(plan.getShipId())) {
            throw new IllegalArgumentException("船舶不存在");
        }
        // 验证港口
        if (plan.getDeparturePort() == null || plan.getDeparturePort().trim().isEmpty()) {
            throw new IllegalArgumentException("出发港口不能为空");
        }
        if (plan.getArrivalPort() == null || plan.getArrivalPort().trim().isEmpty()) {
            throw new IllegalArgumentException("到达港口不能为空");
        }
        // 验证时间
        if (plan.getPlannedDeparture() == null) {
            throw new IllegalArgumentException("计划出发时间不能为空");
        }
        if (plan.getPlannedArrival() == null) {
            throw new IllegalArgumentException("计划到达时间不能为空");
        }
        if (plan.getPlannedArrival().isBefore(plan.getPlannedDeparture())) {
            throw new IllegalArgumentException("计划到达时间不能早于出发时间");
        }
    }

    public LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.trim().isEmpty()) {
            return null;
        }
        try {
            return LocalDateTime.parse(dateTimeStr);
        } catch (DateTimeParseException e) {
            try {
                return LocalDateTime.parse(dateTimeStr, DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));
            } catch (DateTimeParseException e2) {
                throw new IllegalArgumentException("时间格式错误：" + dateTimeStr);
            }
        }
    }
}
