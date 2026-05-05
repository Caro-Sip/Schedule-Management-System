package sms.Config;

import java.sql.Connection;
import java.sql.SQLException;

import org.sqlite.SQLiteDataSource;

public class DatabaseConfig {
    // Database configuration constants
    private static final String DATABASE_URL = "jdbc:sqlite:schedule.db";
    private static final String DATABASE_NAME = "schedule.db";
    
    /**
     * Get a database connection
     * @return Connection object to the SQLite database
     * @throws SQLException if connection fails
     */
    public static Connection getConnection() throws SQLException {
        SQLiteDataSource dataSource = new SQLiteDataSource();
        dataSource.setUrl(DATABASE_URL);
        return dataSource.getConnection();
    }

    /**
     * Get the database URL
     * @return The database URL string
     */
    public static String getDatabaseURL() {
        return DATABASE_URL;
    }

    /**
     * Get the database name
     * @return The database name
     */
    public static String getDatabaseName() {
        return DATABASE_NAME;
    }
}
