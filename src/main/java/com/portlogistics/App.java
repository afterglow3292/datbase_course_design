package com.portlogistics;

import com.portlogistics.model.BerthSchedule;
import com.portlogistics.model.Cargo;
import com.portlogistics.model.Ship;
import com.portlogistics.service.PortLogisticsService;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Scanner;

public final class App {
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private App() {
        // utility class
    }

    public static void main(String[] args) {
        PortLogisticsService service = new PortLogisticsService();
        try (Scanner scanner = new Scanner(System.in)) {
            boolean running = true;
            while (running) {
                printMenu();
                System.out.print("请选择一项: ");
                String choice = scanner.nextLine().trim();
                switch (choice) {
                    case "1" -> listShips(service);
                    case "2" -> registerShip(scanner, service);
                    case "3" -> listPendingCargo(service);
                    case "4" -> assignCargo(scanner, service);
                    case "5" -> scheduleBerth(scanner, service);
                    case "6" -> viewUpcomingSchedules(service);
                    case "0" -> running = false;
                    default -> System.out.println("Unknown option, please try again.\n");
                }
            }
        }
        System.out.println("Goodbye.");
    }

    private static void printMenu() {
        System.out.println();
        System.out.println("==== 港口物流管理系统 ====");
        System.out.println("1. 列出船舶");
        System.out.println("2. 记录船舶状态");
        System.out.println("3. 列出待处理的货物");
        System.out.println("4. 安排货物上船");
        System.out.println("5. 安排使用的泊位");
        System.out.println("6. 查看泊位计划");
        System.out.println("0. 退出");
    }

    private static void listShips(PortLogisticsService service) {
        try {
            List<Ship> ships = service.listShips();
            if (ships.isEmpty()) {
                System.out.println("No ships found.");
            } else {
                ships.forEach(ship -> System.out.println(" - " + ship));
            }
        } catch (SQLException e) {
            System.out.println("Failed to load ships: " + e.getMessage());
        }
    }

    private static void registerShip(Scanner scanner, PortLogisticsService service) {
        System.out.print("Ship name: ");
        String name = scanner.nextLine().trim();
        System.out.print("IMO number: ");
        String imo = scanner.nextLine().trim();
        int capacity = readInteger(scanner, "Capacity (TEU): ");
        Ship ship = new Ship(0, name, imo, capacity, "ARRIVED");
        try {
            service.registerShipArrival(ship);
            System.out.println("Ship registered.");
        } catch (SQLException e) {
            System.out.println("Failed to register ship: " + e.getMessage());
        }
    }

    private static void listPendingCargo(PortLogisticsService service) {
        try {
            List<Cargo> cargoList = service.listPendingCargo();
            if (cargoList.isEmpty()) {
                System.out.println("No cargo awaiting assignment.");
            } else {
                cargoList.forEach(cargo -> System.out.println(" - " + cargo));
            }
        } catch (SQLException e) {
            System.out.println("Failed to load cargo: " + e.getMessage());
        }
    }

    private static void assignCargo(Scanner scanner, PortLogisticsService service) {
        int cargoId = readInteger(scanner, "Cargo ID: ");
        int shipId = readInteger(scanner, "Ship ID: ");
        try {
            service.assignCargoToShip(cargoId, shipId);
            System.out.println("Cargo assigned to ship.");
        } catch (SQLException e) {
            System.out.println("Failed to assign cargo: " + e.getMessage());
        }
    }

    private static void scheduleBerth(Scanner scanner, PortLogisticsService service) {
        int shipId = readInteger(scanner, "Ship ID: ");
        System.out.print("Berth number: ");
        String berthNumber = scanner.nextLine().trim();
        LocalDateTime arrival = promptDateTime(scanner, "Planned arrival", true);
        LocalDateTime departure = promptDateTime(scanner, "Planned departure", false);
        System.out.print("Status (e.g. PLANNED/CONFIRMED): ");
        String status = scanner.nextLine().trim();

        BerthSchedule schedule = new BerthSchedule(0, shipId, berthNumber, arrival, departure, status);
        try {
            service.scheduleBerth(schedule);
            System.out.println("Berth scheduled.");
        } catch (SQLException e) {
            System.out.println("Failed to schedule berth: " + e.getMessage());
        }
    }

    private static void viewUpcomingSchedules(PortLogisticsService service) {
        try {
            List<BerthSchedule> schedules = service.listUpcomingSchedules();
            if (schedules.isEmpty()) {
                System.out.println("No berth schedules recorded.");
            } else {
                schedules.forEach(schedule -> System.out.println(" - " + schedule));
            }
        } catch (SQLException e) {
            System.out.println("Failed to load berth schedules: " + e.getMessage());
        }
    }

    private static int readInteger(Scanner scanner, String prompt) {
        while (true) {
            System.out.print(prompt);
            String input = scanner.nextLine().trim();
            try {
                return Integer.parseInt(input);
            } catch (NumberFormatException e) {
                System.out.println("Please enter a valid integer value.");
            }
        }
    }

    private static LocalDateTime promptDateTime(Scanner scanner, String label, boolean required) {
        while (true) {
            System.out.print(label + " (yyyy-MM-dd HH:mm" + (required ? ")" : ", blank to skip)") + ": ");
            String input = scanner.nextLine().trim();
            if (input.isEmpty() && !required) {
                return null;
            }
            if (input.isEmpty()) {
                System.out.println("This field is required.");
                continue;
            }
            try {
                return LocalDateTime.parse(input, DATE_TIME_FORMATTER);
            } catch (DateTimeParseException e) {
                System.out.println("Invalid date/time format. Please try again.");
            }
        }
    }
}
