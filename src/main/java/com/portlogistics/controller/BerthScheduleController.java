package com.portlogistics.controller;

import com.portlogistics.exception.InvalidScheduleException;
import com.portlogistics.exception.InvalidTimeFormatException;
import com.portlogistics.exception.ScheduleConflictException;
import com.portlogistics.exception.ShipNotFoundException;
import com.portlogistics.model.BerthSchedule;
import com.portlogistics.service.BerthScheduleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping("/api/berths")
public class BerthScheduleController {

    private final BerthScheduleService scheduleService;

    public BerthScheduleController(BerthScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    // 查询所有排程（前端表格加载）
    @GetMapping
    public List<BerthSchedule> list() throws SQLException {
        return scheduleService.getAllSchedules();
    }

    // 创建排程（接收前端JSON，与Apifox格式一致）
    @PostMapping
    public ResponseEntity<String> create(@RequestBody BerthSchedule schedule) {
        try {
            System.out.println("Controller接收参数：" + schedule);
            // 校验核心参数
            if (schedule.getShipId() <= 0 || schedule.getBerthNumber() == null || schedule.getArrivalTime() == null) {
                return ResponseEntity.badRequest().body("船舶ID、泊位编号、到港时间为必填项！");
            }
            // 调用Service保存（包含portId）
            scheduleService.createSchedule(
                    schedule.getShipId(),
                    schedule.getPortId(),
                    schedule.getBerthNumber().trim(),
                    schedule.getArrivalTime().toString(), // LocalDateTime转字符串（ISO格式）
                    schedule.getDepartureTime() != null ? schedule.getDepartureTime().toString() : null,
                    schedule.getStatus() != null ? schedule.getStatus() : "PLANNED"
            );
            return ResponseEntity.ok("泊位排程创建成功！");
        } catch (ShipNotFoundException | InvalidTimeFormatException | InvalidScheduleException | ScheduleConflictException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (SQLException e) {
            System.out.println("数据库错误：" + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("数据库错误：" + e.getMessage());
        } catch (Exception e) {
            System.out.println("系统错误：" + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("系统错误：" + e.getMessage());
        }
    }

    // 更新排程
    @PutMapping("/{id}")
    public ResponseEntity<String> update(@PathVariable int id, @RequestBody BerthSchedule schedule) {
        try {
            System.out.println("Controller更新排程ID：" + id + "，参数：" + schedule);
            // 校验核心参数
            if (schedule.getShipId() <= 0 || schedule.getBerthNumber() == null || schedule.getArrivalTime() == null) {
                return ResponseEntity.badRequest().body("船舶ID、泊位编号、到港时间为必填项！");
            }
            // 调用Service更新（包含portId）
            scheduleService.updateSchedule(
                    id,
                    schedule.getShipId(),
                    schedule.getPortId(),
                    schedule.getBerthNumber().trim(),
                    schedule.getArrivalTime().toString(),
                    schedule.getDepartureTime() != null ? schedule.getDepartureTime().toString() : null,
                    schedule.getStatus() != null ? schedule.getStatus() : "PLANNED"
            );
            return ResponseEntity.ok("泊位排程更新成功！");
        } catch (ShipNotFoundException | InvalidTimeFormatException | InvalidScheduleException | ScheduleConflictException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (SQLException e) {
            System.out.println("数据库错误：" + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("数据库错误：" + e.getMessage());
        } catch (Exception e) {
            System.out.println("系统错误：" + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("系统错误：" + e.getMessage());
        }
    }

    // 删除排程
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable int id) {
        try {
            System.out.println("Controller删除排程ID：" + id);
            scheduleService.deleteSchedule(id);
            return ResponseEntity.ok("泊位排程已删除！");
        } catch (SQLException e) {
            System.out.println("数据库错误：" + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("数据库错误：" + e.getMessage());
        } catch (Exception e) {
            System.out.println("系统错误：" + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("系统错误：" + e.getMessage());
        }
    }
}