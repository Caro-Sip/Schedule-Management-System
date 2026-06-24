package sms;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.Statement;
import org.sqlite.SQLiteDataSource;
import sms.Config.DatabaseConfig;

public class DatabaseInit {
    public static void initializeDatabase(boolean isEmptyShell) {
        String resourcePath = isEmptyShell ? "/db/schema_only.sql" : "/db/V6_SE_AI.sql";
        try {
            // Read SQL file from classpath resources
            String sql;
            try (InputStream in = DatabaseInit.class.getResourceAsStream(resourcePath)) {
                if (in == null) {
                    throw new java.io.FileNotFoundException("SQL migration script not found in resources: " + resourcePath);
                }
                sql = new String(in.readAllBytes(), StandardCharsets.UTF_8);
            }
            
            // Connect to SQLite using dynamic DB URL
            SQLiteDataSource ds = new SQLiteDataSource();
            ds.setUrl(DatabaseConfig.getDatabaseURL());
            
            try (Connection conn = ds.getConnection();
                Statement stmt = conn.createStatement()) {
                stmt.executeUpdate(sql);
                System.out.println("Database initialized successfully from " + resourcePath + "!");
            }
        } catch (Exception e) {
            System.err.println("Failed to initialize database: " + e.getMessage());
        }
    }
}
