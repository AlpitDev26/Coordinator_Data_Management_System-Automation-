package com.ticclub;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class FixDatabaseSchema {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/tic_club_db?currentSchema=tic_club";
        String user = "postgres";
        String pass = "Alpit@PTSQL2603";

        try {
            Class.forName("org.postgresql.Driver");
            try (Connection conn = DriverManager.getConnection(url, user, pass);
                 Statement stmt = conn.createStatement()) {

                System.out.println("Connected to database...");
                
                // Drop legacy date column
                String sql = "ALTER TABLE events DROP COLUMN IF EXISTS date;";
                stmt.executeUpdate(sql);
                System.out.println("Dropped column 'date' if it existed.");
                
                // Try dropping time column as well just in case
                sql = "ALTER TABLE events DROP COLUMN IF EXISTS time;";
                stmt.executeUpdate(sql);
                System.out.println("Dropped column 'time' if it existed.");

                System.out.println("Schema fixed successfully.");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
