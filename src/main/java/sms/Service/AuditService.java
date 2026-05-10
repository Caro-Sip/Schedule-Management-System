package sms.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import sms.Objects.AuditLog;

public class AuditService {

    public void logCreate(String entityType, int entityId, int userId, Map<String, Object> newValues) {
        throw new UnsupportedOperationException("Audit create log not implemented yet");
    }

    public void logUpdate(String entityType, int entityId, int userId,
                          Map<String, Object> oldValues, Map<String, Object> newValues) {
        throw new UnsupportedOperationException("Audit update log not implemented yet");
    }

    public void logDelete(String entityType, int entityId, int userId, Map<String, Object> deletedValues) {
        throw new UnsupportedOperationException("Audit delete log not implemented yet");
    }

    public List<AuditLog> getAuditLogsByEntity(String entityType, int entityId) {
        throw new UnsupportedOperationException("Audit query not implemented yet");
    }

    public List<AuditLog> getAuditLogsByUser(int userId) {
        throw new UnsupportedOperationException("Audit query not implemented yet");
    }

    public List<AuditLog> getAuditLogsByDate(LocalDate date) {
        throw new UnsupportedOperationException("Audit query not implemented yet");
    }

    public List<AuditLog> getAuditLogsByDateRange(LocalDate startDate, LocalDate endDate) {
        throw new UnsupportedOperationException("Audit query not implemented yet");
    }

    public List<AuditLog> getAllAuditLogs() {
        throw new UnsupportedOperationException("Audit query not implemented yet");
    }
}
