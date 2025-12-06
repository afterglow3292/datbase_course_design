package com.portlogistics.service;

import com.portlogistics.exception.InvalidScheduleException;
import com.portlogistics.exception.InvalidTimeFormatException;
import com.portlogistics.exception.ScheduleConflictException;
import com.portlogistics.exception.ShipNotFoundException;
import com.portlogistics.model.BerthSchedule;
import com.portlogistics.repository.BerthScheduleRepository;
import com.portlogistics.repository.ShipRepository;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class BerthScheduleService {
    private final BerthScheduleRepository scheduleRepository;
    private final ShipRepository shipRepository;

    public BerthScheduleService(BerthScheduleRepository scheduleRepository, ShipRepository shipRepository) {
        this.scheduleRepository = scheduleRepository;
        this.shipRepository = shipRepository;
    }

    // 创建排程（带全量校验+日志）
    public void createSchedule(int shipId, String berthNumber, String arrivalTimeStr, String departureTimeStr, String status) throws SQLException {
        System.out.println("Service创建排程：shipId=" + shipId + ", berthNumber=" + berthNumber + ", arrivalTime=" + arrivalTimeStr);

        // 1. 校验船舶存在
        if (!shipRepository.existsById(shipId)) {
            throw new ShipNotFoundException("船舶ID不存在：" + shipId);
        }

        // 2. 解析时间（ISO格式）
        LocalDateTime arrivalTime;
        LocalDateTime departureTime;
        try {
            arrivalTime = LocalDateTime.parse(arrivalTimeStr);
            departureTime = (departureTimeStr == null || departureTimeStr.trim().isEmpty()) ? null : LocalDateTime.parse(departureTimeStr);
        } catch (DateTimeParseException e) {
            throw new InvalidTimeFormatException("时间格式错误（需ISO格式：yyyy-MM-dd'T'HH:mm:ss）：" + e.getMessage());
        }

        // 3. 时间逻辑校验
        if (departureTime != null && arrivalTime.isAfter(departureTime)) {
            throw new InvalidScheduleException("到港时间不能晚于离港时间");
        }

        // 4. 冲突检测
        if (scheduleRepository.hasConflict(berthNumber, arrivalTime, departureTime)) {
            throw new ScheduleConflictException("泊位[" + berthNumber + "]时间段冲突");
        }

        // 5. 保存排程
        BerthSchedule schedule = new BerthSchedule(
                0, shipId, berthNumber, arrivalTime, departureTime, status
        );
        scheduleRepository.save(schedule);
        System.out.println("Service保存排程成功：" + schedule);
    }

    // 按日期查询
    public List<BerthSchedule> getSchedulesByDate(LocalDate date) throws SQLException {
        return scheduleRepository.findByDate(date);
    }

    // 更新状态
    public void updateScheduleStatus(int scheduleId, String newStatus) throws SQLException {
        scheduleRepository.updateStatus(scheduleId, newStatus);
    }

    // 即将到来的排程
    public List<BerthSchedule> getUpcomingSchedules() throws SQLException {
        return scheduleRepository.findUpcomingSchedules();
    }

    // 查询所有排程
    public List<BerthSchedule> getAllSchedules() throws SQLException {
        return scheduleRepository.findAll();
    }

    // 更新排程（带全量校验）
    public void updateSchedule(int scheduleId, int shipId, String berthNumber, String arrivalTimeStr, String departureTimeStr, String status) throws SQLException {
        System.out.println("Service更新排程：scheduleId=" + scheduleId + ", shipId=" + shipId + ", berthNumber=" + berthNumber);

        // 1. 校验船舶存在
        if (!shipRepository.existsById(shipId)) {
            throw new ShipNotFoundException("船舶ID不存在：" + shipId);
        }

        // 2. 解析时间（ISO格式）
        LocalDateTime arrivalTime;
        LocalDateTime departureTime;
        try {
            arrivalTime = LocalDateTime.parse(arrivalTimeStr);
            departureTime = (departureTimeStr == null || departureTimeStr.trim().isEmpty()) ? null : LocalDateTime.parse(departureTimeStr);
        } catch (DateTimeParseException e) {
            throw new InvalidTimeFormatException("时间格式错误（需ISO格式：yyyy-MM-dd'T'HH:mm:ss）：" + e.getMessage());
        }

        // 3. 时间逻辑校验
        if (departureTime != null && arrivalTime.isAfter(departureTime)) {
            throw new InvalidScheduleException("到港时间不能晚于离港时间");
        }

        // 4. 冲突检测（排除自身）
        if (scheduleRepository.hasConflictExcludingSelf(scheduleId, berthNumber, arrivalTime, departureTime)) {
            throw new ScheduleConflictException("泊位[" + berthNumber + "]时间段冲突");
        }

        // 5. 更新排程
        BerthSchedule schedule = new BerthSchedule(
                scheduleId, shipId, berthNumber, arrivalTime, departureTime, status
        );
        scheduleRepository.update(schedule);
        System.out.println("Service更新排程成功：" + schedule);
    }

    // 删除排程
    public void deleteSchedule(int scheduleId) throws SQLException {
        System.out.println("Service删除排程：scheduleId=" + scheduleId);
        scheduleRepository.deleteById(scheduleId);
        System.out.println("Service删除排程成功");
    }
}