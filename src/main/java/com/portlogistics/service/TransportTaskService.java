package com.portlogistics.service;

import com.portlogistics.model.TransportTask;
import com.portlogistics.repository.TransportTaskRepository;
import com.portlogistics.repository.CargoRepository;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class TransportTaskService {
    private final TransportTaskRepository transportTaskRepository;
    private final CargoRepository cargoRepository;

    public TransportTaskService(TransportTaskRepository transportTaskRepository, CargoRepository cargoRepository) {
        this.transportTaskRepository = transportTaskRepository;
        this.cargoRepository = cargoRepository;
    }

    public List<TransportTask> getAllTasks() throws SQLException {
        return transportTaskRepository.findAll();
    }

    public TransportTask getTaskById(int taskId) throws SQLException {
        return transportTaskRepository.findById(taskId);
    }

    public void createTask(TransportTask task) throws SQLException {
        validateTask(task, 0);
        if (task.getStatus() == null || task.getStatus().isEmpty()) {
            task.setStatus("PENDING");
        }
        transportTaskRepository.save(task);
    }

    public void updateTask(TransportTask task) throws SQLException {
        validateTask(task, task.getTaskId());
        transportTaskRepository.update(task);
    }

    public void deleteTask(int taskId) throws SQLException {
        transportTaskRepository.deleteById(taskId);
    }

    public void updateStatus(int taskId, String newStatus) throws SQLException {
        TransportTask task = transportTaskRepository.findById(taskId);
        if (task == null) {
            throw new IllegalArgumentException("运输任务不存在");
        }
        
        task.setStatus(newStatus);
        
        // 自动记录实际时间
        if ("IN_TRANSIT".equals(newStatus) && task.getActualPickup() == null) {
            task.setActualPickup(LocalDateTime.now());
        } else if ("DELIVERED".equals(newStatus) && task.getActualDelivery() == null) {
            task.setActualDelivery(LocalDateTime.now());
        }
        
        transportTaskRepository.update(task);
    }


    private void validateTask(TransportTask task, int excludeId) throws SQLException {
        // 验证任务编号
        if (task.getTaskNumber() == null || task.getTaskNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("任务编号不能为空");
        }
        // 检查任务编号是否重复
        if (transportTaskRepository.isTaskNumberExists(task.getTaskNumber().trim(), excludeId)) {
            throw new IllegalArgumentException("任务编号已存在");
        }
        // 验证车牌号
        if (task.getTruckLicense() == null || task.getTruckLicense().trim().isEmpty()) {
            throw new IllegalArgumentException("车牌号不能为空");
        }
        // 验证司机姓名
        if (task.getDriverName() == null || task.getDriverName().trim().isEmpty()) {
            throw new IllegalArgumentException("司机姓名不能为空");
        }
        // 验证取货地点
        if (task.getPickupLocation() == null || task.getPickupLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("取货地点不能为空");
        }
        // 验证交付地点
        if (task.getDeliveryLocation() == null || task.getDeliveryLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("交付地点不能为空");
        }
        // 验证货物是否存在（如果指定了货物）
        if (task.getCargoId() != null && task.getCargoId() > 0) {
            if (!cargoRepository.existsById(task.getCargoId())) {
                throw new IllegalArgumentException("关联的货物不存在");
            }
        }
        // 验证时间逻辑
        if (task.getPlannedPickup() != null && task.getPlannedDelivery() != null) {
            if (task.getPlannedDelivery().isBefore(task.getPlannedPickup())) {
                throw new IllegalArgumentException("计划交付时间不能早于计划取货时间");
            }
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
