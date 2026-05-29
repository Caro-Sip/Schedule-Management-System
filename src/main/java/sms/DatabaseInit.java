package sms;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.Statement;

import org.sqlite.SQLiteDataSource;

public class DatabaseInit {
    public static void initializeDatabase() {
        try{
            // Read SQL file
            String sql = new String(Files.readAllBytes(Paths.get("db/V4_class_courses.sql")));
            
            // Connect to SQLite
            SQLiteDataSource ds = new SQLiteDataSource();
            ds.setUrl("jdbc:sqlite:schedule.db");
            
            try (Connection conn = ds.getConnection();
                Statement stmt = conn.createStatement()) {
                stmt.executeUpdate(sql);
                System.out.println("Database initialized successfully!");
            }
        } catch (Exception e){
            System.err.println("Failed to initialize database: " + e.getMessage());
            // e.printStackTrace();
        }
    }
}
