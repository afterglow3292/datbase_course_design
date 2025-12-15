package com.portlogistics;
import com.portlogistics.service.BerthScheduleService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDate;
import java.util.Scanner;

@SpringBootApplication
public class PortLogisticsApplication {
    public static void main(String[] args){
        SpringApplication.run(PortLogisticsApplication.class,args);
    }

    @Bean
    CommandLineRunner run(BerthScheduleService scheduleService) {
        return args -> {
            Scanner scanner = new Scanner(System.in);
            System.out.println("===== 泊位排程系统 =====");
            System.out.println("命令：create 船舶ID 港口ID 泊位号 到港时间 离港时间(可选) 状态 | list 日期 | upcoming | update 排程ID 状态 | exit");

            while (true) {
                System.out.print("\n输入命令：");
                String input = scanner.nextLine().trim();
                if (input.equalsIgnoreCase("exit")) break;
                if (input.isEmpty()) continue;

                String[] parts = input.split("\\s+");
                try {
                    switch (parts[0].toLowerCase()) {
                        case "create":
                            if (parts.length < 6) { System.out.println("参数不足，格式：create 船舶ID 港口ID 泊位号 到港时间 离港时间(可选) 状态"); break; }
                            int shipId = Integer.parseInt(parts[1]);
                            int portId = Integer.parseInt(parts[2]);
                            String berth = parts[3];
                            String arrTime = parts[4] + " " + parts[5];
                            String depTime = parts.length >= 8 ? parts[6] + " " + parts[7] : null;
                            String status = parts.length >= 9 ? parts[8] : "PLANNED";
                            scheduleService.createSchedule(shipId, portId, berth, arrTime, depTime, status);
                            System.out.println("创建成功");
                            break;
                        case "list":
                            if (parts.length != 2) { System.out.println("参数错误"); break; }
                            scheduleService.getSchedulesByDate(LocalDate.parse(parts[1])).forEach(System.out::println);
                            break;
                        case "upcoming":
                            scheduleService.getUpcomingSchedules().forEach(System.out::println);
                            break;
                        case "update":
                            if (parts.length != 3) { System.out.println("参数错误"); break; }
                            scheduleService.updateScheduleStatus(Integer.parseInt(parts[1]), parts[2]);
                            System.out.println("更新成功");
                            break;
                        default:
                            System.out.println("未知命令");
                    }
                } catch (Exception e) {
                    System.out.println("错误：" + e.getMessage());
                }
            }
            scanner.close();
        };
    }
}
