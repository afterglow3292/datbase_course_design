package com.portlogistics.model;

public class Ship {
    private int id;
    private String name;
    private String imo;
    private int capacityTeu;
    private String status;

    public Ship() {
        // default constructor required for JSON binding
    }

    public Ship(int id, String name, String imo, int capacityTeu, String status) {
        this.id = id;
        this.name = name;
        this.imo = imo;
        this.capacityTeu = capacityTeu;
        this.status = status;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImo() {
        return imo;
    }

    public void setImo(String imo) {
        this.imo = imo;
    }

    public int getCapacityTeu() {
        return capacityTeu;
    }

    public void setCapacityTeu(int capacityTeu) {
        this.capacityTeu = capacityTeu;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Ship withStatus(String newStatus) {
        return new Ship(id, name, imo, capacityTeu, newStatus);
    }

    @Override
    public String toString() {
        return "Ship{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", imo='" + imo + '\'' +
                ", capacityTeu=" + capacityTeu +
                ", status='" + status + '\'' +
                '}';
    }
}
