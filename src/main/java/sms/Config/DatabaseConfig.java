package sms.Config;

import java.io.File;
import java.sql.Connection;
import java.sql.SQLException;
import org.sqlite.SQLiteDataSource;

public class DatabaseConfig {
    private static final String DATABASE_NAME = "schedule.db";
    private static String databasePath = null;

    /**
     * Get the resolved absolute database path.
     * If running from a JAR, it puts schedule.db in the directory where the JAR is located.
     * If running in development (e.g. from target/classes or classes directory), it falls back to the project root.
     */
    public static synchronized String getResolvedDatabasePath() {
        if (databasePath != null) {
            return databasePath;
        }

        try {
            // Get location of the compiled class
            java.net.URL classUrl = DatabaseConfig.class.getProtectionDomain().getCodeSource().getLocation();
            if (classUrl != null) {
                File codeLocation = new File(classUrl.toURI());
                File targetFolder = codeLocation.getParentFile();
                
                // If we are running from target/classes, place it in the project root
                if (codeLocation.isDirectory() || codeLocation.getName().endsWith(".class")) {
                    databasePath = new File(System.getProperty("user.dir"), DATABASE_NAME).getAbsolutePath();
                } else {
                    // Running from JAR
                    databasePath = new File(targetFolder, DATABASE_NAME).getAbsolutePath();
                }
            }
        } catch (Exception e) {
            System.err.println("Could not resolve dynamic DB folder: " + e.getMessage());
        }

        if (databasePath == null) {
            // Fallback to relative path in CWD
            databasePath = DATABASE_NAME;
        }
        return databasePath;
    }

    /**
     * Get a database connection
     * @return Connection object to the SQLite database
     * @throws SQLException if connection fails
     */
    public static Connection getConnection() throws SQLException {
        SQLiteDataSource dataSource = new SQLiteDataSource();
        dataSource.setUrl(getDatabaseURL());
        return dataSource.getConnection();
    }

    /**
     * Get the database URL
     * @return The database URL string
     */
    public static String getDatabaseURL() {
        return "jdbc:sqlite:" + getResolvedDatabasePath();
    }

    /**
     * Get the database name
     * @return The database name
     */
    public static String getDatabaseName() {
        return getResolvedDatabasePath();
    }
}
